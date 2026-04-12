import { execa } from 'execa';
import { realpath } from 'node:fs/promises';
import path from 'node:path';
import type { OpenCodeInstallMethod, OpenCodeStatus } from '../types/index.js';
import { findExecutable } from '../utils/command.js';

async function detectInstalledMethods(): Promise<OpenCodeInstallMethod[]> {
  const methods = new Set<OpenCodeInstallMethod>();

  try {
    await execa('brew', ['list', '--versions', 'opencode']);
    methods.add('homebrew');
  } catch {
    // Ignore missing Homebrew-managed installs.
  }

  try {
    await execa('npm', ['list', '-g', 'opencode-ai', '--depth=0']);
    methods.add('npm');
  } catch {
    // Ignore missing npm-managed installs.
  }

  return Array.from(methods);
}

async function getHomebrewRoots(): Promise<string[]> {
  try {
    const [{ stdout: brewPrefixStdout }, { stdout: formulaPrefixStdout }, { stdout: cellarStdout }] =
      await Promise.all([
        execa('brew', ['--prefix']),
        execa('brew', ['--prefix', 'opencode']),
        execa('brew', ['--cellar', 'opencode']),
      ]);
    const brewPrefix = brewPrefixStdout.trim();
    const formulaPrefix = formulaPrefixStdout.trim();
    const cellarPrefix = cellarStdout.trim();

    return [
      path.join(brewPrefix, 'bin', 'opencode'),
      path.join(formulaPrefix, 'bin', 'opencode'),
      cellarPrefix,
    ].map((entry) => path.normalize(entry));
  } catch {
    return [];
  }
}

async function getNpmRoots(): Promise<string[]> {
  try {
    const [{ stdout: prefixStdout }, { stdout: rootStdout }] = await Promise.all([
      execa('npm', ['prefix', '-g']),
      execa('npm', ['root', '-g']),
    ]);
    const prefix = prefixStdout.trim();
    const root = rootStdout.trim();
    const binDir = process.platform === 'win32' ? prefix : path.join(prefix, 'bin');

    return [path.join(binDir, 'opencode'), path.join(root, 'opencode-ai')].map((entry) =>
      path.normalize(entry)
    );
  } catch {
    return [];
  }
}

async function resolveActiveInstallMethod(
  executablePath: string | null,
  installMethods: OpenCodeInstallMethod[]
): Promise<OpenCodeInstallMethod | null> {
  if (!executablePath || installMethods.length === 0) {
    return null;
  }

  const normalizedExecutablePath = path.normalize(executablePath);
  const realExecutablePath = await realpath(normalizedExecutablePath).catch(() => normalizedExecutablePath);
  const matchesMethod = async (method: OpenCodeInstallMethod, roots: string[]) => {
    const normalizedRoots = await Promise.all(
      roots.map(async (root) => {
        const normalizedRoot = path.normalize(root);
        const realRoot = await realpath(normalizedRoot).catch(() => normalizedRoot);
        return { normalizedRoot, realRoot };
      })
    );

    return normalizedRoots.some(({ normalizedRoot, realRoot }) => {
      const exactMatch =
        normalizedExecutablePath === normalizedRoot || realExecutablePath === normalizedRoot;
      const childMatch =
        normalizedExecutablePath.startsWith(`${normalizedRoot}${path.sep}`) ||
        realExecutablePath.startsWith(`${normalizedRoot}${path.sep}`) ||
        normalizedExecutablePath.startsWith(`${realRoot}${path.sep}`) ||
        realExecutablePath.startsWith(`${realRoot}${path.sep}`);

      return method === 'homebrew' ? exactMatch || childMatch : exactMatch || childMatch;
    });
  };

  const methodChecks = await Promise.all(
    installMethods.map(async (method) => ({
      method,
      matches: await matchesMethod(method, method === 'homebrew' ? await getHomebrewRoots() : await getNpmRoots()),
    }))
  );

  const matchedMethods = methodChecks.filter((entry) => entry.matches);

  return matchedMethods.length === 1 ? matchedMethods[0]?.method ?? null : null;
}

function orderInstallMethods(
  installMethods: OpenCodeInstallMethod[],
  activeInstallMethod: OpenCodeInstallMethod | null
): OpenCodeInstallMethod[] {
  if (!activeInstallMethod) {
    return installMethods;
  }

  return [activeInstallMethod, ...installMethods.filter((method) => method !== activeInstallMethod)];
}

export async function checkOpenCode(): Promise<OpenCodeStatus> {
  try {
    const { stdout } = await execa('opencode', ['--version']);
    const version = stdout.trim();
    const [executablePath, installMethods] = await Promise.all([
      findExecutable('opencode'),
      detectInstalledMethods(),
    ]);
    const activeInstallMethod = await resolveActiveInstallMethod(executablePath, installMethods);
    const orderedInstallMethods = orderInstallMethods(installMethods, activeInstallMethod);
    const installationAlignment =
      installMethods.length === 0
        ? 'unknown'
        : activeInstallMethod
          ? 'matched'
          : 'mismatch';

    return {
      installed: true,
      version,
      path: executablePath,
      installMethods: orderedInstallMethods,
      activeInstallMethod,
      installationAlignment,
    };
  } catch {
    return {
      installed: false,
      version: null,
      path: null,
      installMethods: [],
      activeInstallMethod: null,
      installationAlignment: 'unknown',
    };
  }
}

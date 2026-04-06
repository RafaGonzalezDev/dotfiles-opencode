import { execa } from 'execa';
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

export async function checkOpenCode(): Promise<OpenCodeStatus> {
  try {
    const { stdout } = await execa('opencode', ['--version']);
    const version = stdout.trim();
    const [path, installMethods] = await Promise.all([
      findExecutable('opencode'),
      detectInstalledMethods(),
    ]);

    return {
      installed: true,
      version,
      path,
      installMethods,
    };
  } catch {
    return {
      installed: false,
      version: null,
      path: null,
      installMethods: [],
    };
  }
}

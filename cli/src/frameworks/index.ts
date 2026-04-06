import * as fs from 'fs';
import * as path from 'path';
import { MANAGED_CONFIG_ENTRIES } from '../utils/managed-config.js';
import { getFrameworksRootDir } from '../utils/paths.js';
import type { FrameworkDefinition } from '../types/index.js';

function toDisplayName(id: string): string {
  return id
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isValidFrameworkDirectory(frameworkPath: string): Promise<boolean> {
  for (const entry of MANAGED_CONFIG_ENTRIES) {
    if (!(await pathExists(path.join(frameworkPath, entry)))) {
      return false;
    }
  }

  return true;
}

export async function listFrameworks(): Promise<FrameworkDefinition[]> {
  const frameworksRoot = getFrameworksRootDir();
  const entries = await fs.promises.readdir(frameworksRoot, { withFileTypes: true });
  const frameworks: FrameworkDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const frameworkPath = path.join(frameworksRoot, entry.name);
    if (!(await isValidFrameworkDirectory(frameworkPath))) {
      continue;
    }

    frameworks.push({
      id: entry.name,
      name: toDisplayName(entry.name),
      path: frameworkPath,
      readmePath: path.join(frameworkPath, 'README.md'),
    });
  }

  frameworks.sort((a, b) => {
    if (a.id === 'default') {
      return -1;
    }

    if (b.id === 'default') {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  return frameworks;
}

export async function getFrameworkSourceDir(frameworkId: string): Promise<string> {
  const frameworks = await listFrameworks();
  const framework = frameworks.find((entry) => entry.id === frameworkId);

  if (!framework) {
    throw new Error(`Framework "${frameworkId}" was not found.`);
  }

  return framework.path;
}

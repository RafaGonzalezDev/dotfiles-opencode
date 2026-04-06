import * as fs from 'fs';
import * as path from 'path';
import { REQUIRED_FRAMEWORK_ENTRIES } from '../utils/managed-config.js';
import { getFrameworksRootDir } from '../utils/paths.js';
import type { FrameworkDefinition } from '../types/index.js';

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isValidFrameworkDirectory(frameworkPath: string): Promise<boolean> {
  for (const entry of REQUIRED_FRAMEWORK_ENTRIES) {
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
      name: entry.name,
      path: frameworkPath,
      readmePath: path.join(frameworkPath, 'README.md'),
    });
  }

  frameworks.sort((a, b) => {
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

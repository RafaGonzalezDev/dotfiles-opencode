import * as fs from 'fs';
import * as path from 'path';
import type { VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { MANAGED_CONFIG_DIRECTORIES, REQUIRED_FRAMEWORK_FILES } from '../utils/managed-config.js';

const CONFIG_DIR = getConfigDir();

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function verifyInstallation(): Promise<VerifyResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of REQUIRED_FRAMEWORK_FILES) {
    const filePath = path.join(CONFIG_DIR, file);
    if (!(await fileExists(filePath))) {
      errors.push(`${file} is missing`);
      continue;
    }

    if (file === 'opencode.json') {
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        JSON.parse(content);
      } catch {
        errors.push('opencode.json is not valid JSON');
      }
    }
  }

  for (const directory of MANAGED_CONFIG_DIRECTORIES) {
    const directoryPath = path.join(CONFIG_DIR, directory);

    if (!(await fileExists(directoryPath))) {
      errors.push(`${directory}/ directory is missing`);
      continue;
    }

    const directoryEntries = await fs.promises.readdir(directoryPath);
    if (directoryEntries.length === 0) {
      warnings.push(`${directory}/ directory is empty`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

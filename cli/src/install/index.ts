import * as fs from 'fs';
import * as path from 'path';
import type { InstallResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { MANAGED_CONFIG_ENTRIES } from '../utils/managed-config.js';
import { getFrameworkSourceDir } from '../frameworks/index.js';

const CONFIG_DIR = getConfigDir();

async function copyPath(src: string, dest: string): Promise<{ copied: number; errors: string[] }> {
  let copied = 0;
  const errors: string[] = [];

  try {
    const stat = await fs.promises.stat(src);

    if (stat.isDirectory()) {
      await fs.promises.mkdir(dest, { recursive: true });
      const entries = await fs.promises.readdir(src, { withFileTypes: true });

      for (const entry of entries) {
        const result = await copyPath(
          path.join(src, entry.name),
          path.join(dest, entry.name)
        );
        copied += result.copied;
        errors.push(...result.errors);
      }

      return { copied, errors };
    }

    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.copyFile(src, dest);

    if (stat.mode & 0o111) {
      await fs.promises.chmod(dest, stat.mode);
    }

    copied++;
  } catch (err) {
    errors.push(`Failed to copy ${src}: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return { copied, errors };
}

async function validateFrameworkEntries(frameworkDir: string): Promise<string[]> {
  const errors: string[] = [];

  for (const entry of MANAGED_CONFIG_ENTRIES) {
    const sourcePath = path.join(frameworkDir, entry);

    try {
      await fs.promises.access(sourcePath);
    } catch {
      errors.push(`Missing required framework entry: ${sourcePath}`);
    }
  }

  return errors;
}

export async function installConfig(frameworkId: string): Promise<InstallResult> {
  const frameworkDir = await getFrameworkSourceDir(frameworkId);
  const validationErrors = await validateFrameworkEntries(frameworkDir);

  if (validationErrors.length > 0) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      frameworkId,
      errors: validationErrors,
    };
  }

  try {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
  } catch (err) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      frameworkId,
      errors: [
        `Failed to create config directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
      ],
    };
  }

  let copied = 0;
  const errors: string[] = [];

  for (const entry of MANAGED_CONFIG_ENTRIES) {
    try {
      await fs.promises.rm(path.join(CONFIG_DIR, entry), {
        recursive: true,
        force: true,
      });
    } catch (err) {
      errors.push(
        `Failed to remove existing ${entry}: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  if (errors.length > 0) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      frameworkId,
      errors,
    };
  }

  for (const entry of MANAGED_CONFIG_ENTRIES) {
    const srcPath = path.join(frameworkDir, entry);
    const destPath = path.join(CONFIG_DIR, entry);

    const result = await copyPath(srcPath, destPath);
    copied += result.copied;
    errors.push(...result.errors);
  }

  const hasErrors = errors.length > 0;

  return {
    status: hasErrors ? (copied > 0 ? 'partial' : 'failed') : 'success',
    success: !hasErrors,
    filesInstalled: copied,
    frameworkId,
    errors,
  };
}

import * as fs from 'fs';
import * as path from 'path';
import type { InstallResult } from '../types/index.js';
import { getConfigDir, getOpencodeSourceDir } from '../utils/paths.js';
import { MANAGED_CONFIG_ENTRIES } from '../utils/managed-config.js';

const CONFIG_DIR = getConfigDir();
const REPO_CONFIG_DIR = getOpencodeSourceDir();

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

export async function installConfig(): Promise<InstallResult> {
  try {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
  } catch (err) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      errors: [
        `Failed to create config directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
      ],
    };
  }

  let copied = 0;
  const errors: string[] = [];

  for (const entry of MANAGED_CONFIG_ENTRIES) {
    const srcPath = path.join(REPO_CONFIG_DIR, entry);
    const destPath = path.join(CONFIG_DIR, entry);

    try {
      await fs.promises.access(srcPath);
    } catch {
      errors.push(`Missing required source entry: ${srcPath}`);
      continue;
    }

    const result = await copyPath(srcPath, destPath);
    copied += result.copied;
    errors.push(...result.errors);
  }

  const hasErrors = errors.length > 0;

  return {
    status: hasErrors ? (copied > 0 ? 'partial' : 'failed') : 'success',
    success: !hasErrors,
    filesInstalled: copied,
    errors,
  };
}

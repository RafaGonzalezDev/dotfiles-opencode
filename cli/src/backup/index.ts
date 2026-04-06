import * as fs from 'fs';
import * as path from 'path';
import type { BackupEntry, BackupResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { MANAGED_CONFIG_ENTRIES } from '../utils/managed-config.js';

const CONFIG_DIR = getConfigDir();
const BACKUPS_DIR = path.join(CONFIG_DIR, 'backups');

function getTimestamp(): string {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '00';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}_${getPart('hour')}-${getPart('minute')}-${getPart('second')}`;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyPath(src: string, dest: string): Promise<number> {
  const stats = await fs.promises.stat(src);

  if (stats.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    let copied = 0;

    for (const entry of entries) {
      copied += await copyPath(
        path.join(src, entry.name),
        path.join(dest, entry.name)
      );
    }

    return copied;
  }

  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
  return 1;
}

async function countFiles(rootDir: string): Promise<number> {
  let total = 0;

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else {
        total++;
      }
    }
  }

  await walk(rootDir);
  return total;
}

export async function createBackup(): Promise<BackupResult> {
  try {
    await fs.promises.access(CONFIG_DIR);
  } catch {
    return {
      success: true,
      backupPath: null,
      filesBackedUp: 0,
    };
  }

  const existingEntries: string[] = [];

  for (const entry of MANAGED_CONFIG_ENTRIES) {
    const srcPath = path.join(CONFIG_DIR, entry);
    if (await pathExists(srcPath)) {
      existingEntries.push(entry);
    }
  }

  if (existingEntries.length === 0) {
    return {
      success: true,
      backupPath: null,
      filesBackedUp: 0,
    };
  }

  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });

  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUPS_DIR, `backup-${timestamp}`);
  await fs.promises.mkdir(backupPath, { recursive: true });

  let filesBackedUp = 0;

  for (const entry of existingEntries) {
    const srcPath = path.join(CONFIG_DIR, entry);
    const destPath = path.join(backupPath, entry);
    filesBackedUp += await copyPath(srcPath, destPath);
  }

  return {
    success: true,
    backupPath,
    filesBackedUp,
  };
}

export async function listRecentBackups(limit = 5): Promise<BackupEntry[]> {
  try {
    const entries = await fs.promises.readdir(BACKUPS_DIR, { withFileTypes: true });
    const directories = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const backupPath = path.join(BACKUPS_DIR, entry.name);
          const stats = await fs.promises.stat(backupPath);
          const filesBackedUp = await countFiles(backupPath);

          return {
            name: entry.name,
            path: backupPath,
            createdAt: stats.mtime.toISOString(),
            filesBackedUp,
          };
        })
    );

    return directories
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function restoreBackup(
  backupPath: string
): Promise<{ success: boolean; filesRestored: number; error?: string }> {
  const resolvedBackupPath = path.resolve(backupPath);
  const resolvedBackupsDir = path.resolve(BACKUPS_DIR);

  if (!resolvedBackupPath.startsWith(resolvedBackupsDir + path.sep)) {
    return {
      success: false,
      filesRestored: 0,
      error: 'Invalid backup path.',
    };
  }

  try {
    const stats = await fs.promises.stat(resolvedBackupPath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        filesRestored: 0,
        error: 'Selected backup is not a directory.',
      };
    }
  } catch {
    return {
      success: false,
      filesRestored: 0,
      error: 'Selected backup does not exist.',
    };
  }

  try {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });

    for (const entry of MANAGED_CONFIG_ENTRIES) {
      await fs.promises.rm(path.join(CONFIG_DIR, entry), {
        recursive: true,
        force: true,
      });
    }

    let filesRestored = 0;

    for (const entry of MANAGED_CONFIG_ENTRIES) {
      const srcPath = path.join(resolvedBackupPath, entry);
      const destPath = path.join(CONFIG_DIR, entry);

      if (!(await pathExists(srcPath))) {
        continue;
      }

      filesRestored += await copyPath(srcPath, destPath);
    }

    return {
      success: true,
      filesRestored,
    };
  } catch (error) {
    return {
      success: false,
      filesRestored: 0,
      error: error instanceof Error ? error.message : 'Unknown restore error',
    };
  }
}

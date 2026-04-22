import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  BackupEntry,
  BackupManifest,
  BackupManifestV1,
  BackupManifestV2,
  BackupResult,
} from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { MANAGED_CONFIG_ENTRIES, REQUIRED_FRAMEWORK_FILES } from '../utils/managed-config.js';
import {
  collectManagedTree,
  compareManagedManifests,
  copyManagedPath,
  pathExists,
} from '../utils/managed-tree.js';
import {
  applyManagedStaging,
  createPreparedTransaction,
  restoreManagedRollback,
} from '../utils/managed-transaction.js';

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

async function readBackupManifest(backupPath: string): Promise<BackupManifest | null> {
  try {
    const manifestPath = path.join(backupPath, 'manifest.json');
    const content = await fs.promises.readFile(manifestPath, 'utf-8');
    const parsed = JSON.parse(content) as BackupManifest;

    if (parsed.version === 1 && Array.isArray((parsed as BackupManifestV1).entries)) {
      return parsed;
    }

    if (
      parsed.version === 2 &&
      Array.isArray((parsed as BackupManifestV2).topLevelEntries) &&
      Array.isArray((parsed as BackupManifestV2).files)
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function getManifestTopLevelEntries(manifest: BackupManifest): string[] {
  return manifest.version === 2 ? manifest.topLevelEntries : manifest.entries;
}

async function verifyLegacyBackupBasics(backupPath: string, entries: string[]): Promise<string[]> {
  const errors: string[] = [];

  for (const file of REQUIRED_FRAMEWORK_FILES) {
    if (!entries.includes(file)) {
      errors.push(`Backup is missing required entry: ${file}`);
      continue;
    }

    const filePath = path.join(backupPath, file);
    if (!(await pathExists(filePath))) {
      errors.push(`Backup is missing required file: ${file}`);
      continue;
    }

    if (file === 'opencode.json') {
      try {
        JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
      } catch {
        errors.push('Backup opencode.json is not valid JSON');
      }
    }
  }

  return errors;
}

export async function createBackup(context?: { frameworkId?: string | null }): Promise<BackupResult> {
  if (!(await pathExists(CONFIG_DIR))) {
    return {
      success: true,
      backupPath: null,
      filesBackedUp: 0,
      frameworkId: context?.frameworkId ?? null,
    };
  }

  const sourceTree = await collectManagedTree(CONFIG_DIR, MANAGED_CONFIG_ENTRIES);
  if (sourceTree.errors.length > 0) {
    return {
      success: false,
      backupPath: null,
      filesBackedUp: 0,
      frameworkId: context?.frameworkId ?? null,
      error: sourceTree.errors.join(' | '),
    };
  }

  if (sourceTree.manifest.topLevelEntries.length === 0) {
    return {
      success: true,
      backupPath: null,
      filesBackedUp: 0,
      frameworkId: context?.frameworkId ?? null,
    };
  }

  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
  const backupPath = await fs.promises.mkdtemp(path.join(BACKUPS_DIR, `backup-${getTimestamp()}-`));

  try {
    let filesBackedUp = 0;

    for (const entry of sourceTree.manifest.topLevelEntries) {
      filesBackedUp += await copyManagedPath(
        path.join(CONFIG_DIR, entry),
        path.join(backupPath, entry)
      );
    }

    const backupTree = await collectManagedTree(backupPath, MANAGED_CONFIG_ENTRIES);
    const backupErrors = [
      ...backupTree.errors,
      ...compareManagedManifests(sourceTree.manifest, backupTree.manifest, 'Backup snapshot'),
    ];

    if (backupErrors.length > 0) {
      await fs.promises.rm(backupPath, { recursive: true, force: true });
      return {
        success: false,
        backupPath: null,
        filesBackedUp: 0,
        frameworkId: context?.frameworkId ?? null,
        error: backupErrors.join(' | '),
      };
    }

    const manifest: BackupManifestV2 = {
      version: 2,
      backupId: path.basename(backupPath),
      createdAt: new Date().toISOString(),
      frameworkId: context?.frameworkId ?? null,
      topLevelEntries: backupTree.manifest.topLevelEntries,
      files: backupTree.manifest.files,
    };

    await fs.promises.writeFile(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n',
      'utf-8'
    );

    const writtenManifest = await readBackupManifest(backupPath);
    if (!writtenManifest || writtenManifest.version !== 2) {
      await fs.promises.rm(backupPath, { recursive: true, force: true });
      return {
        success: false,
        backupPath: null,
        filesBackedUp: 0,
        frameworkId: context?.frameworkId ?? null,
        error: 'Backup manifest validation failed after writing the snapshot.',
      };
    }

    return {
      success: true,
      backupPath,
      filesBackedUp,
      frameworkId: manifest.frameworkId,
    };
  } catch (error) {
    await fs.promises.rm(backupPath, { recursive: true, force: true });
    return {
      success: false,
      backupPath: null,
      filesBackedUp: 0,
      frameworkId: context?.frameworkId ?? null,
      error: error instanceof Error ? error.message : 'Unknown backup error',
    };
  }
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
          const manifest = await readBackupManifest(backupPath);
          const filesBackedUp = manifest?.version === 2
            ? manifest.files.length
            : manifest
              ? Math.max(0, (await countFiles(backupPath)) - 1)
              : await countFiles(backupPath);

          return {
            name: entry.name,
            path: backupPath,
            createdAt: stats.mtime.toISOString(),
            filesBackedUp,
            frameworkId: manifest?.frameworkId ?? null,
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
    const stats = await fs.promises.lstat(resolvedBackupPath);
    if (stats.isSymbolicLink()) {
      return {
        success: false,
        filesRestored: 0,
        error: 'Selected backup cannot be a symbolic link.',
      };
    }

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

  const manifest = await readBackupManifest(resolvedBackupPath);
  if (!manifest) {
    return {
      success: false,
      filesRestored: 0,
      error: 'Selected backup has an invalid manifest.',
    };
  }

  const backupTree = await collectManagedTree(resolvedBackupPath, MANAGED_CONFIG_ENTRIES);
  const manifestEntries = getManifestTopLevelEntries(manifest);
  const manifestErrors = manifest.version === 2
    ? compareManagedManifests(
        {
          topLevelEntries: manifest.topLevelEntries,
          files: manifest.files,
        },
        backupTree.manifest,
        'Backup snapshot'
      )
    : await verifyLegacyBackupBasics(resolvedBackupPath, manifestEntries);

  const validationErrors = [...backupTree.errors, ...manifestErrors];
  if (validationErrors.length > 0) {
    return {
      success: false,
      filesRestored: 0,
      error: validationErrors.join(' | '),
    };
  }

  const transaction = await createPreparedTransaction(CONFIG_DIR);

  try {
    for (const entry of manifestEntries) {
      const srcPath = path.join(resolvedBackupPath, entry);
      if (!(await pathExists(srcPath))) {
        continue;
      }

      await copyManagedPath(srcPath, path.join(transaction.stagingRoot, entry));
    }

    const stagedTree = await collectManagedTree(transaction.stagingRoot, MANAGED_CONFIG_ENTRIES);
    const stagedErrors = manifest.version === 2
      ? compareManagedManifests(
          {
            topLevelEntries: manifest.topLevelEntries,
            files: manifest.files,
          },
          stagedTree.manifest,
          'Restore staging area'
        )
      : await verifyLegacyBackupBasics(transaction.stagingRoot, manifestEntries);

    if (stagedTree.errors.length > 0 || stagedErrors.length > 0) {
      return {
        success: false,
        filesRestored: 0,
        error: [...stagedTree.errors, ...stagedErrors].join(' | '),
      };
    }

    try {
      await applyManagedStaging(CONFIG_DIR, transaction.stagingRoot, transaction.rollbackRoot);
    } catch (error) {
      return {
        success: false,
        filesRestored: 0,
        error: error instanceof Error ? error.message : 'Unknown restore error',
      };
    }

    const restoredTree = await collectManagedTree(CONFIG_DIR, MANAGED_CONFIG_ENTRIES);
    const restoredErrors = manifest.version === 2
      ? compareManagedManifests(
          {
            topLevelEntries: manifest.topLevelEntries,
            files: manifest.files,
          },
          restoredTree.manifest,
          'Restored configuration'
        )
      : await verifyLegacyBackupBasics(CONFIG_DIR, manifestEntries);

    if (restoredTree.errors.length > 0 || restoredErrors.length > 0) {
      await restoreManagedRollback(CONFIG_DIR, transaction.rollbackRoot);
      return {
        success: false,
        filesRestored: 0,
        error: [...restoredTree.errors, ...restoredErrors].join(' | '),
      };
    }

    return {
      success: true,
      filesRestored: restoredTree.manifest.files.length,
    };
  } catch (error) {
    return {
      success: false,
      filesRestored: 0,
      error: error instanceof Error ? error.message : 'Unknown restore error',
    };
  } finally {
    await transaction.cleanup();
  }
}

import * as path from 'node:path';
import type { InstallResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { MANAGED_CONFIG_ENTRIES, REQUIRED_FRAMEWORK_ENTRIES } from '../utils/managed-config.js';
import { getFrameworkSourceDir } from '../frameworks/index.js';
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

async function validateFrameworkEntries(frameworkDir: string): Promise<string[]> {
  const errors: string[] = [];

  for (const entry of REQUIRED_FRAMEWORK_ENTRIES) {
    const sourcePath = path.join(frameworkDir, entry);
    if (!(await pathExists(sourcePath))) {
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

  const frameworkTree = await collectManagedTree(frameworkDir, MANAGED_CONFIG_ENTRIES);
  if (frameworkTree.errors.length > 0) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      frameworkId,
      errors: frameworkTree.errors,
    };
  }

  const transaction = await createPreparedTransaction(CONFIG_DIR);

  try {
    let copied = 0;

    for (const entry of MANAGED_CONFIG_ENTRIES) {
      const srcPath = path.join(frameworkDir, entry);
      if (!(await pathExists(srcPath))) {
        continue;
      }

      copied += await copyManagedPath(srcPath, path.join(transaction.stagingRoot, entry));
    }

    const stagedTree = await collectManagedTree(transaction.stagingRoot, MANAGED_CONFIG_ENTRIES);
    const stagedErrors = [
      ...stagedTree.errors,
      ...compareManagedManifests(frameworkTree.manifest, stagedTree.manifest, 'Staging area'),
    ];

    if (stagedErrors.length > 0) {
      return {
        status: 'failed',
        success: false,
        filesInstalled: 0,
        frameworkId,
        errors: stagedErrors,
      };
    }

    try {
      await applyManagedStaging(CONFIG_DIR, transaction.stagingRoot, transaction.rollbackRoot);
    } catch (error) {
      return {
        status: 'failed',
        success: false,
        filesInstalled: 0,
        frameworkId,
        errors: [error instanceof Error ? error.message : 'Unknown apply error'],
        rolledBack: true,
      };
    }

    if (process.env.OPENCODE_SETUP_FAIL_AFTER_APPLY === '1') {
      await restoreManagedRollback(CONFIG_DIR, transaction.rollbackRoot);
      return {
        status: 'failed',
        success: false,
        filesInstalled: 0,
        frameworkId,
        errors: ['Forced failure after apply for transaction rollback testing'],
        rolledBack: true,
      };
    }

    const installedTree = await collectManagedTree(CONFIG_DIR, MANAGED_CONFIG_ENTRIES);
    const installErrors = [
      ...installedTree.errors,
      ...compareManagedManifests(frameworkTree.manifest, installedTree.manifest, 'Installed configuration'),
    ];

    if (installErrors.length > 0) {
      await restoreManagedRollback(CONFIG_DIR, transaction.rollbackRoot);
      return {
        status: 'failed',
        success: false,
        filesInstalled: 0,
        frameworkId,
        errors: installErrors,
        rolledBack: true,
      };
    }

    return {
      status: 'success',
      success: true,
      filesInstalled: copied,
      frameworkId,
      errors: [],
    };
  } catch (error) {
    return {
      status: 'failed',
      success: false,
      filesInstalled: 0,
      frameworkId,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  } finally {
    await transaction.cleanup();
  }
}

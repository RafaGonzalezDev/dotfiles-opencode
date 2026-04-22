import type { VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { getFrameworkSourceDir } from '../frameworks/index.js';
import { MANAGED_CONFIG_ENTRIES } from '../utils/managed-config.js';
import { collectManagedTree, compareManagedManifests } from '../utils/managed-tree.js';

const CONFIG_DIR = getConfigDir();

export async function verifyInstallation(frameworkId: string): Promise<VerifyResult> {
  const frameworkDir = await getFrameworkSourceDir(frameworkId);
  const [frameworkTree, installedTree] = await Promise.all([
    collectManagedTree(frameworkDir, MANAGED_CONFIG_ENTRIES),
    collectManagedTree(CONFIG_DIR, MANAGED_CONFIG_ENTRIES),
  ]);

  const errors = [
    ...frameworkTree.errors,
    ...installedTree.errors,
    ...compareManagedManifests(
      frameworkTree.manifest,
      installedTree.manifest,
      'Installed configuration'
    ),
  ];

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

import * as path from 'node:path';
import type { ConfigDetectionResult, ConfigFile, ManagedFileRecord } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { getFrameworkSourceDir } from '../frameworks/index.js';
import {
  MANAGED_CONFIG_DIRECTORIES,
  MANAGED_CONFIG_ENTRIES,
  MANAGED_CONFIG_FILES,
} from '../utils/managed-config.js';
import { collectManagedTree, pathExists } from '../utils/managed-tree.js';

const CONFIG_DIR = getConfigDir();

function getDirectoryRecords(files: ManagedFileRecord[], directory: string): ManagedFileRecord[] {
  const prefix = `${directory}/`;
  return files.filter((file) => file.relativePath.startsWith(prefix));
}

function getDirectoryStatus(
  expectedFiles: ManagedFileRecord[],
  actualFiles: ManagedFileRecord[],
  actualTopLevels: Set<string>
): ConfigFile['status'] {
  if (!actualTopLevels.has(expectedFiles[0]?.relativePath.split('/')[0] || '')) {
    return 'new';
  }

  if (expectedFiles.length !== actualFiles.length) {
    return 'different';
  }

  const actualMap = new Map(actualFiles.map((file) => [file.relativePath, file]));

  for (const file of expectedFiles) {
    const actualFile = actualMap.get(file.relativePath);
    if (!actualFile || actualFile.sha256 !== file.sha256 || actualFile.mode !== file.mode) {
      return 'different';
    }
  }

  return 'identical';
}

export async function detectConfig(frameworkId: string): Promise<ConfigDetectionResult> {
  const frameworkDir = await getFrameworkSourceDir(frameworkId);
  const configExists = await pathExists(CONFIG_DIR);

  if (!configExists) {
    return {
      configDirExists: false,
      frameworkId,
      files: [],
    };
  }

  const [frameworkTree, configTree] = await Promise.all([
    collectManagedTree(frameworkDir, MANAGED_CONFIG_ENTRIES),
    collectManagedTree(CONFIG_DIR, MANAGED_CONFIG_ENTRIES),
  ]);

  const inspectionErrors = [...frameworkTree.errors, ...configTree.errors];
  if (inspectionErrors.length > 0) {
    throw new Error(inspectionErrors.join(' | '));
  }

  const configTopLevels = new Set(configTree.manifest.topLevelEntries);
  const configFilesByPath = new Map(
    configTree.manifest.files.map((file) => [file.relativePath, file])
  );
  const files: ConfigFile[] = [];

  for (const file of MANAGED_CONFIG_FILES) {
    const repoFile = frameworkTree.manifest.files.find((entry) => entry.relativePath === file);
    if (!repoFile) {
      continue;
    }

    const currentFile = configFilesByPath.get(file);
    const status: ConfigFile['status'] = !configTopLevels.has(file)
      ? 'new'
      : currentFile && currentFile.sha256 === repoFile.sha256 && currentFile.mode === repoFile.mode
        ? 'identical'
        : 'different';

    files.push({
      path: file,
      status,
      repoHash: repoFile.sha256,
      currentHash: currentFile?.sha256,
    });
  }

  for (const directory of MANAGED_CONFIG_DIRECTORIES) {
    const expectedFiles = getDirectoryRecords(frameworkTree.manifest.files, directory);
    if (expectedFiles.length === 0) {
      continue;
    }

    files.push({
      path: `${directory}/`,
      status: getDirectoryStatus(
        expectedFiles,
        getDirectoryRecords(configTree.manifest.files, directory),
        configTopLevels
      ),
    });
  }

  return {
    configDirExists: true,
    frameworkId,
    files,
  };
}

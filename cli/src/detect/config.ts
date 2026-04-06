import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { ConfigDetectionResult, ConfigFile } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import { getFrameworkSourceDir } from '../frameworks/index.js';

const CONFIG_DIR = getConfigDir();

async function getFileHash(filePath: string): Promise<string> {
  try {
    const content = await fs.promises.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return '';
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function buildDirectoryManifest(rootDir: string): Promise<Map<string, string>> {
  const manifest = new Map<string, string>();

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else {
        const relativePath = path.relative(rootDir, entryPath);
        manifest.set(relativePath, await getFileHash(entryPath));
      }
    }
  }

  await walk(rootDir);
  return manifest;
}

async function compareDirectories(repoDir: string, configDir: string): Promise<ConfigFile['status']> {
  const configExists = await fileExists(configDir);
  if (!configExists) {
    return 'new';
  }

  const [repoManifest, configManifest] = await Promise.all([
    buildDirectoryManifest(repoDir),
    buildDirectoryManifest(configDir),
  ]);

  if (repoManifest.size !== configManifest.size) {
    return 'different';
  }

  for (const [relativePath, repoHash] of repoManifest.entries()) {
    if (configManifest.get(relativePath) !== repoHash) {
      return 'different';
    }
  }

  return 'identical';
}

export async function detectConfig(frameworkId: string): Promise<ConfigDetectionResult> {
  const frameworkDir = await getFrameworkSourceDir(frameworkId);
  const configExists = await fileExists(CONFIG_DIR);
  
  if (!configExists) {
    return {
      configDirExists: false,
      frameworkId,
      files: [],
    };
  }
  
  const files: ConfigFile[] = [];
  const configFiles = ['opencode.json', 'AGENTS.md'];
  
  for (const file of configFiles) {
    const repoPath = path.join(frameworkDir, file);
    const configPath = path.join(CONFIG_DIR, file);
    
    const repoExists = await fileExists(repoPath);
    const configExistsFlag = await fileExists(configPath);
    
    if (!repoExists) continue;
    
    const repoHash = await getFileHash(repoPath);
    const configHash = configExistsFlag ? await getFileHash(configPath) : '';
    
    let status: ConfigFile['status'] = 'new';
    if (configExistsFlag) {
      if (repoHash === configHash) {
        status = 'identical';
      } else {
        status = 'different';
      }
    }
    
    files.push({
      path: file,
      status,
      repoHash,
      currentHash: configHash || undefined,
    });
  }
  
  // Check agents directory
  const repoAgentsDir = path.join(frameworkDir, 'agents');
  const configAgentsDir = path.join(CONFIG_DIR, 'agents');
  
  const repoAgentsExists = await fileExists(repoAgentsDir);
  
  if (repoAgentsExists) {
    files.push({
      path: 'agents/',
      status: await compareDirectories(repoAgentsDir, configAgentsDir),
    });
  }
  
  // Check skills directory
  const repoSkillsDir = path.join(frameworkDir, 'skills');
  const configSkillsDir = path.join(CONFIG_DIR, 'skills');
  
  const repoSkillsExists = await fileExists(repoSkillsDir);
  
  if (repoSkillsExists) {
    files.push({
      path: 'skills/',
      status: await compareDirectories(repoSkillsDir, configSkillsDir),
    });
  }
  
  return {
    configDirExists: true,
    frameworkId,
    files,
  };
}

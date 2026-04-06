import * as fs from 'fs';
import * as path from 'path';
import type { VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';

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
  
  // Check opencode.json exists and is valid JSON
  const opencodeJsonPath = path.join(CONFIG_DIR, 'opencode.json');
  if (await fileExists(opencodeJsonPath)) {
    try {
      const content = await fs.promises.readFile(opencodeJsonPath, 'utf-8');
      JSON.parse(content);
    } catch {
      errors.push('opencode.json is not valid JSON');
    }
  } else {
    errors.push('opencode.json is missing');
  }
  
  // Check AGENTS.md exists
  const agentsMdPath = path.join(CONFIG_DIR, 'AGENTS.md');
  if (!(await fileExists(agentsMdPath))) {
    errors.push('AGENTS.md is missing');
  }
  
  // Check agents directory
  const agentsDir = path.join(CONFIG_DIR, 'agents');
  if (!(await fileExists(agentsDir))) {
    errors.push('agents/ directory is missing');
  } else {
    const agentsFiles = await fs.promises.readdir(agentsDir);
    if (agentsFiles.length === 0) {
      warnings.push('agents/ directory is empty');
    }
  }
  
  // Check skills directory
  const skillsDir = path.join(CONFIG_DIR, 'skills');
  if (!(await fileExists(skillsDir))) {
    errors.push('skills/ directory is missing');
  } else {
    const skillsFiles = await fs.promises.readdir(skillsDir);
    if (skillsFiles.length === 0) {
      warnings.push('skills/ directory is empty');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

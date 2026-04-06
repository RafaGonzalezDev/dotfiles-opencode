import { execa } from 'execa';
import type { OpenCodeStatus } from '../types/index.js';
import { findExecutable } from '../utils/command.js';

export async function checkOpenCode(): Promise<OpenCodeStatus> {
  try {
    const { stdout } = await execa('opencode', ['--version']);
    const version = stdout.trim();
    
    const path = await findExecutable('opencode');
    
    return {
      installed: true,
      version,
      path,
    };
  } catch {
    return {
      installed: false,
      version: null,
      path: null,
    };
  }
}

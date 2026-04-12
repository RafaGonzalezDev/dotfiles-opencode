import { execa } from 'execa';
import type { OpenCodeInstallMethod } from '../types/index.js';

const INSTALL_MESSAGES = [
  'Installing...',
  'Hold on...',
  'Casi listo...',
  'Finalizando...',
];

export async function installOpenCode(
  method: OpenCodeInstallMethod,
  onProgress: (message: string) => void
): Promise<{ success: boolean; error?: string }> {
  onProgress(
    method === 'homebrew'
      ? 'Installing OpenCode with Homebrew...'
      : 'Installing OpenCode with npm...'
  );
  let messageIndex = 0;
  const interval = setInterval(() => {
    messageIndex = (messageIndex + 1) % INSTALL_MESSAGES.length;
    onProgress(INSTALL_MESSAGES[messageIndex]);
  }, 2500);
  
  try {
    if (method === 'homebrew') {
      await execa('brew', ['install', 'opencode']);
    } else {
      await execa('npm', ['install', '-g', 'opencode-ai']);
    }
    
    // Verify installation
    try {
      await execa('opencode', ['--version']);
      return { success: true };
    } catch {
      return { success: false, error: 'OpenCode was installed but verification failed' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    clearInterval(interval);
  }
}

export async function updateOpenCode(
  method: OpenCodeInstallMethod,
  onProgress: (message: string) => void
): Promise<{ success: boolean; error?: string }> {
  onProgress(
    method === 'homebrew'
      ? 'Updating OpenCode with Homebrew...'
      : 'Updating OpenCode with npm...'
  );
  let messageIndex = 0;
  const interval = setInterval(() => {
    messageIndex = (messageIndex + 1) % INSTALL_MESSAGES.length;
    onProgress(INSTALL_MESSAGES[messageIndex]);
  }, 2500);

  try {
    if (method === 'homebrew') {
      await execa('brew', ['update']);
      await execa('brew', ['upgrade', 'opencode']);
    } else {
      await execa('npm', ['install', '-g', 'opencode-ai']);
    }

    await execa('opencode', ['--version']);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    clearInterval(interval);
  }
}

export function getOpenCodeInstallCommand(method: OpenCodeInstallMethod): string {
  if (method === 'homebrew') {
    return 'brew install opencode';
  }
  return 'npm install -g opencode-ai';
}

export function getOpenCodeUpdateCommand(method: OpenCodeInstallMethod): string {
  if (method === 'homebrew') {
    return 'brew update && brew upgrade opencode';
  }

  return 'npm install -g opencode-ai';
}

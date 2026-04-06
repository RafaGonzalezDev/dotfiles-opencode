import { execa } from 'execa';

const INSTALL_MESSAGES = [
  'Installing...',
  'Un momento...',
  'Casi listo...',
  'Finalizando...',
];

export type InstallMethod = 'homebrew' | 'npm';

export async function installOpenCode(
  method: InstallMethod,
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

export function getOpenCodeInstallCommand(method: InstallMethod): string {
  if (method === 'homebrew') {
    return 'brew install opencode';
  }
  return 'npm install -g opencode-ai';
}

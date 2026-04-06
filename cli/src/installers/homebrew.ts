import { execa } from 'execa';

const INSTALL_MESSAGES = [
  'Installing...',
  'Hold on...',
  'Casi listo...',
  'Finalizando...',
];

export async function installHomebrew(
  onProgress: (message: string) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    onProgress('Installing Homebrew...');
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % INSTALL_MESSAGES.length;
      onProgress(INSTALL_MESSAGES[messageIndex]);
    }, 2500);
    
    try {
      await execa('bash', ['-c', 'curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash'], {
        stdio: 'pipe',
      });
    } finally {
      clearInterval(interval);
    }
    
    // Verify installation
    try {
      await execa('brew', ['--version']);
      return { success: true };
    } catch {
      return { success: false, error: 'Homebrew was installed but brew --version failed' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getHomebrewInstallCommand(): string {
  return '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
}

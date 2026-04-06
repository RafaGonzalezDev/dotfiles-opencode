import { Text, Box, useInput } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';
import type { CheckResult, OpenCodeStatus, SystemInfo } from '../types/index.js';

interface SystemCheckScreenProps {
  checks: CheckResult[];
  systemInfo: SystemInfo | null;
  openCodeStatus: OpenCodeStatus | null;
  isChecking: boolean;
  onComplete: () => void;
}

function formatOsLabel(os?: SystemInfo['os'] | null): string {
  switch (os) {
    case 'macos':
      return 'macOS';
    case 'linux':
      return 'Linux';
    case 'windows':
      return 'Windows';
    case 'windows-wsl':
      return 'Windows (WSL)';
    default:
      return 'Unknown';
  }
}

export function SystemCheckScreen({
  checks,
  systemInfo,
  openCodeStatus,
  isChecking,
  onComplete,
}: SystemCheckScreenProps) {
  useInput((_input, key) => {
    if (!isChecking && key.return) {
      onComplete();
    }
  });
  
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold>System Check</Text>
      </Box>

      {isChecking && (
        <Box paddingTop={1}>
          <Text><Spinner />{' '}Checking system...</Text>
        </Box>
      )}

      {!isChecking && systemInfo && (
        <Box flexDirection="column">
          <Box flexDirection="column" paddingBottom={1}>
            <Text bold>Environment</Text>
            <Text dimColor>OS: {formatOsLabel(systemInfo.os)}</Text>
            <Text dimColor>Shell: {systemInfo.shell}</Text>
            <Text dimColor>Node.js: {systemInfo.nodeVersion || 'Not installed'}</Text>
            <Text dimColor>npm: {systemInfo.npmVersion || 'Not installed'}</Text>
            <Text dimColor>Git: {systemInfo.gitVersion || 'Not installed'}</Text>
            <Text dimColor>Homebrew: {systemInfo.homebrewInstalled ? 'Installed' : 'Not installed'}</Text>
          </Box>

          <Box flexDirection="column" paddingBottom={1}>
            <Text bold>OpenCode</Text>
            <Text dimColor>Status: {openCodeStatus?.installed ? 'Installed' : 'Not installed'}</Text>
            <Text dimColor>Version: {openCodeStatus?.version || 'Not available'}</Text>
            <Text dimColor>Path: {openCodeStatus?.path || 'Not available'}</Text>
          </Box>

          <Box paddingTop={1}>
            <Text color="cyan"><Spinner /> Press Enter to continue.</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

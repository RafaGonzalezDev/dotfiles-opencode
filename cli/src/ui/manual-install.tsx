import React from 'react';
import { Box, Text, useInput } from 'ink';

interface ManualInstallScreenProps {
  command: string;
  onRetryCheck: () => void;
  onBack: () => void;
}

export function ManualInstallScreen({
  command,
  onRetryCheck,
  onBack,
}: ManualInstallScreenProps) {
  useInput((input, key) => {
    if (key.return) {
      onRetryCheck();
    } else if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="yellow">Manual OpenCode installation</Text>
      </Box>

      <Text>Run this command in another terminal:</Text>
      <Box paddingTop={1} paddingBottom={1}>
        <Text color="cyan">{command}</Text>
      </Box>

      <Text dimColor>Press Enter after installation to verify OpenCode again.</Text>
      <Text dimColor>Press Esc to go back and choose another method.</Text>
    </Box>
  );
}

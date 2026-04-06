import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { ConfigFile } from '../types/index.js';

interface DifferencesScreenProps {
  conflicts: ConfigFile[];
  onBack: () => void;
}

export function DifferencesScreen({ conflicts, onBack }: DifferencesScreenProps) {
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="yellow">Detected differences</Text>
      </Box>

      <Text>The following items differ from the repository version:</Text>

      <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
        {conflicts.map((file) => (
          <Text key={file.path}>
            - {file.path} ({file.status})
          </Text>
        ))}
      </Box>

      <Box paddingTop={1}>
        <Text dimColor>Press Enter or Esc to go back.</Text>
      </Box>
    </Box>
  );
}

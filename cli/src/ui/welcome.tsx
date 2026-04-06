import { Text, Box } from 'ink';
import React from 'react';
import SelectInput from 'ink-select-input';

interface WelcomeScreenProps {
  message?: string | null;
  onStartSetup: () => void;
  onRestoreBackups: () => void;
  onExit: () => void;
}

export function WelcomeScreen({
  message,
  onStartSetup,
  onRestoreBackups,
  onExit,
}: WelcomeScreenProps) {
  const items = [
    { label: 'Install or update configuration', value: 'install' },
    { label: 'Restore from backup', value: 'restore' },
    { label: 'Exit', value: 'exit' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="cyan">OpenCode Setup</Text>
      </Box>

      {message && (
        <Box paddingBottom={1}>
          <Text color={message.toLowerCase().includes('failed') ? 'red' : 'green'}>
            {message}
          </Text>
        </Box>
      )}

      <Text>Welcome! This tool will help you configure your OpenCode environment.</Text>
      <Box paddingTop={1}>
        <Text dimColor>Note: This installation will configure OpenCode globally at:</Text>
      </Box>
      <Text dimColor>  ~/.config/opencode/</Text>

      <Box paddingTop={2}>
        <SelectInput
          items={items}
          onSelect={(item) => {
            switch (item.value) {
              case 'install':
                onStartSetup();
                break;
              case 'restore':
                onRestoreBackups();
                break;
              case 'exit':
                onExit();
                break;
            }
          }}
        />
      </Box>
    </Box>
  );
}

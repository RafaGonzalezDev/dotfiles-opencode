import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import type { OSType } from '../types/index.js';

interface OpenCodeInstallScreenProps {
  os: OSType;
  homebrewInstalled: boolean;
  errorMessage?: string | null;
  onSelectHomebrew: () => void;
  onSelectNpm: () => void;
  onManualInstall: () => void;
}

export function OpenCodeInstallScreen({
  os,
  homebrewInstalled,
  errorMessage,
  onSelectHomebrew,
  onSelectNpm,
  onManualInstall,
}: OpenCodeInstallScreenProps) {
  const items: Array<{ label: string; value: string }> = [];
  
  if (os !== 'windows') {
    items.push(
      {
        label: homebrewInstalled ? 'Homebrew (Recommended)' : 'Install Homebrew + OpenCode (Recommended)',
        value: 'homebrew',
      },
      {
        label: 'npm',
        value: 'npm',
      }
    );
  } else {
    items.push({
      label: 'npm',
      value: 'npm',
    });
  }
  
  items.push({
    label: 'Show installation command',
    value: 'manual',
  });
  
  const handleSelect = (item: { value: string }) => {
    switch (item.value) {
      case 'homebrew':
        onSelectHomebrew();
        break;
      case 'npm':
        onSelectNpm();
        break;
      case 'manual':
        onManualInstall();
        break;
    }
  };
  
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="yellow">OpenCode is not installed</Text>
      </Box>

      {errorMessage && (
        <Box paddingBottom={1}>
          <Text color="red">{errorMessage}</Text>
        </Box>
      )}
      
      <Box paddingBottom={1}>
        <Text>Choose how to install OpenCode:</Text>
      </Box>
      
      <Box paddingLeft={2} paddingBottom={1}>
        <SelectInput
          items={items}
          onSelect={handleSelect}
          initialIndex={0}
        />
      </Box>
      
      <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
        {os !== 'windows' && (
          <Box flexDirection="column">
            <Text dimColor>
              {homebrewInstalled
                ? "Homebrew: Updates are simpler with 'brew upgrade'"
                : 'Recommended: install Homebrew first, then install OpenCode with brew'}
            </Text>
            <Text dimColor>npm: Works cross-platform, but updates remain manual</Text>
          </Box>
        )}
        {os === 'windows' && (
          <Text dimColor>npm: Homebrew is not available on Windows natively</Text>
        )}
      </Box>
    </Box>
  );
}

import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { ConfigFile } from '../types/index.js';

interface InstallConfirmationScreenProps {
  frameworkName: string;
  files: ConfigFile[];
  backupNotice?: string | null;
  restoreNotice?: string | null;
  onContinueInstall: () => void;
  onShowRecentBackups: () => void;
  onCancel: () => void;
}

export function InstallConfirmationScreen({
  frameworkName,
  files,
  backupNotice,
  restoreNotice,
  onContinueInstall,
  onShowRecentBackups,
  onCancel,
}: InstallConfirmationScreenProps) {
  const hasChanges = files.some((file) => file.status === 'different' || file.status === 'new');
  const hasExistingConfig = files.some((file) => file.status !== 'new');
  const heading = files.length === 0
    ? 'A new OpenCode configuration will be installed'
    : hasChanges
    ? hasExistingConfig
      ? 'Your OpenCode configuration will be updated'
      : 'A new OpenCode configuration will be installed'
    : 'Your OpenCode configuration is already up to date';
  const backupMessage = hasExistingConfig
    ? backupNotice || 'A safety backup will be created automatically before continuing.'
    : 'No backup is needed because no previous configuration was found.';

  const items = [
    { label: hasChanges ? 'Continue' : 'Reinstall anyway', value: 'continue' },
    { label: 'Restore a recent backup', value: 'restore' },
    { label: 'Cancel installation', value: 'cancel' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="cyan">Ready to import configuration</Text>
      </Box>

      <Box paddingBottom={1}>
        <Text>Selected framework: {frameworkName}</Text>
      </Box>

      {backupNotice && (
        <Box paddingBottom={1}>
          <Text color="cyan">{backupNotice}</Text>
        </Box>
      )}

      {restoreNotice && (
        <Box paddingBottom={1}>
          <Text color={restoreNotice.toLowerCase().includes('failed') ? 'red' : 'green'}>
            {restoreNotice}
          </Text>
        </Box>
      )}

      <Box paddingBottom={1}>
        <Text>{heading}</Text>
      </Box>

      <Box paddingBottom={1}>
        <Text dimColor>{backupMessage}</Text>
      </Box>

      <SelectInput
        items={items}
        onSelect={(item) => {
          switch (item.value) {
            case 'continue':
              onContinueInstall();
              break;
            case 'restore':
              onShowRecentBackups();
              break;
            case 'cancel':
              onCancel();
              break;
          }
        }}
      />
    </Box>
  );
}

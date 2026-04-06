import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import type { ConfigFile } from '../types/index.js';

interface ConflictResolutionScreenProps {
  conflicts: ConfigFile[];
  backupNotice?: string | null;
  restoreNotice?: string | null;
  onContinueInstall: () => void;
  onViewDiff: () => void;
  onShowRecentBackups: () => void;
  onCancel: () => void;
}

export function ConflictResolutionScreen({
  conflicts,
  backupNotice,
  restoreNotice,
  onContinueInstall,
  onViewDiff,
  onShowRecentBackups,
  onCancel,
}: ConflictResolutionScreenProps) {
  const items = [
    { label: 'Continue installation (automatic backup first)', value: 'continue' },
    { label: 'View differences', value: 'diff' },
    { label: 'Restore a recent backup', value: 'restore' },
    { label: 'Cancel installation', value: 'cancel' },
  ];
  
  const handleSelect = (item: { value: string }) => {
    switch (item.value) {
      case 'continue':
        onContinueInstall();
        break;
      case 'diff':
        onViewDiff();
        break;
      case 'restore':
        onShowRecentBackups();
        break;
      case 'cancel':
        onCancel();
        break;
    }
  };
  
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="yellow">Existing configuration detected</Text>
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
        <Text>The following files differ from your repository:</Text>
      </Box>
      
      <Box flexDirection="column" paddingLeft={2} paddingBottom={1}>
        {conflicts.map((file) => (
          <Box key={file.path} justifyContent="space-between">
            <Text>{file.path}</Text>
            <Text dimColor>(
              {file.status === 'different' ? 'different' : 
               file.status === 'new' ? 'new' : 'identical'}
            )</Text>
          </Box>
        ))}
      </Box>
      
      <Box paddingTop={1}>
        <SelectInput items={items} onSelect={handleSelect} initialIndex={0} />
      </Box>
    </Box>
  );
}

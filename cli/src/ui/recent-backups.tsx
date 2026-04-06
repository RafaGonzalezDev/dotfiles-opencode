import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { BackupEntry } from '../types/index.js';

interface RecentBackupsScreenProps {
  backups: BackupEntry[];
  selectedFrameworkName?: string | null;
  message?: string | null;
  onRestore: (backup: BackupEntry) => void;
  onBack: () => void;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function RecentBackupsScreen({
  backups,
  selectedFrameworkName,
  message,
  onRestore,
  onBack,
}: RecentBackupsScreenProps) {
  const items = backups.map((backup) => ({
    label: `${formatTimestamp(backup.createdAt)} · ${backup.filesBackedUp} files${
      backup.frameworkId ? ` · ${backup.frameworkId}` : ''
    }`,
    value: backup.path,
  }));

  items.push({
    label: 'Back',
    value: '__back__',
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="cyan">Recent backups</Text>
      </Box>

      {selectedFrameworkName && (
        <Box paddingBottom={1}>
          <Text dimColor>Current selected framework: {selectedFrameworkName}</Text>
        </Box>
      )}

      {message && (
        <Box paddingBottom={1}>
          <Text color={message.toLowerCase().includes('failed') ? 'red' : 'green'}>
            {message}
          </Text>
        </Box>
      )}

      {backups.length === 0 ? (
        <Box flexDirection="column">
          <Text>No backups were found in ~/.config/opencode/backups.</Text>
          <Box paddingTop={1}>
            <Text dimColor>Press Enter on Back to return.</Text>
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column" paddingBottom={1}>
          <Text>Select one of the 5 most recent backups to restore it:</Text>
        </Box>
      )}

      <Box paddingLeft={2}>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === '__back__') {
              onBack();
              return;
            }

            const backup = backups.find((entry) => entry.path === item.value);
            if (backup) {
              onRestore(backup);
            }
          }}
        />
      </Box>

      {backups.length > 0 && (
        <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
          {backups.map((backup) => (
            <Text key={backup.path} dimColor>
              {backup.name}: {backup.path}
              {backup.frameworkId ? ` (${backup.frameworkId})` : ''}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}

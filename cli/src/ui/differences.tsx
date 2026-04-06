import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { ConfigFile } from '../types/index.js';
import { KeyHints, ScreenLayout, SectionCard } from './components/primitives.js';

interface DifferencesScreenProps {
  frameworkName: string;
  conflicts: ConfigFile[];
  onBack: () => void;
}

export function DifferencesScreen({ frameworkName, conflicts, onBack }: DifferencesScreenProps) {
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onBack();
    }
  });

  return (
    <ScreenLayout
      title="Detected differences"
      step="Detailed inspection"
      subtitle={`These managed entries differ from the selected framework: ${frameworkName}.`}
      footer={<KeyHints hints={[{ keyLabel: 'Enter/Esc', description: 'go back' }]} />}
    >
      <SectionCard title="Managed entries">
        {conflicts.map((file) => (
          <Box key={file.path}>
            <Text>{file.path}</Text>
            <Text dimColor>{` (${file.status})`}</Text>
          </Box>
        ))}
      </SectionCard>
    </ScreenLayout>
  );
}

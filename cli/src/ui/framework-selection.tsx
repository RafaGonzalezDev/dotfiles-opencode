import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { FrameworkDefinition } from '../types/index.js';

interface FrameworkSelectionScreenProps {
  frameworks: FrameworkDefinition[];
  selectedFrameworkId?: string | null;
  onSelect: (framework: FrameworkDefinition) => void;
  onCancel: () => void;
}

export function FrameworkSelectionScreen({
  frameworks,
  selectedFrameworkId,
  onSelect,
  onCancel,
}: FrameworkSelectionScreenProps) {
  const items = frameworks.map((framework) => ({
    label: `${framework.name} (${framework.id})`,
    value: framework.id,
  }));

  items.push({
    label: 'Cancel installation',
    value: '__cancel__',
  });

  const initialIndex = Math.max(
    0,
    frameworks.findIndex((framework) => framework.id === selectedFrameworkId)
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="cyan">Choose a framework</Text>
      </Box>

      <Box paddingBottom={1}>
        <Text>Select which OpenCode framework should be installed globally.</Text>
      </Box>

      <Box paddingBottom={1}>
        <Text dimColor>The installer will back up and replace the managed entries in ~/.config/opencode/.</Text>
      </Box>

      <SelectInput
        items={items}
        initialIndex={initialIndex}
        onSelect={(item) => {
          if (item.value === '__cancel__') {
            onCancel();
            return;
          }

          const framework = frameworks.find((entry) => entry.id === item.value);
          if (framework) {
            onSelect(framework);
          }
        }}
      />
    </Box>
  );
}

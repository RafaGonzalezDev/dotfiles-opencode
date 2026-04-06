import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FrameworkDefinition } from '../types/index.js';
import { KeyHints, ScreenLayout, SectionCard } from './components/primitives.js';
import { uiColors } from './components/theme.js';

interface FrameworkSelectionScreenProps {
  frameworks: FrameworkDefinition[];
  selectedFrameworkId?: string | null;
  onSelect: (framework: FrameworkDefinition) => void;
  onCancel: () => void;
}

type FrameworkRow =
  | { type: 'heading'; key: string; label: string }
  | { type: 'framework'; key: string; framework: FrameworkDefinition };

function getInitialSelectableIndex(rows: FrameworkRow[], selectedFrameworkId?: string | null): number {
  if (selectedFrameworkId) {
    const selectedIndex = rows.findIndex(
      (row) => row.type === 'framework' && row.framework.id === selectedFrameworkId
    );

    if (selectedIndex >= 0) {
      return selectedIndex;
    }
  }

  return rows.findIndex((row) => row.type !== 'heading');
}

function getNextSelectableIndex(
  rows: FrameworkRow[],
  currentIndex: number,
  direction: 1 | -1
): number {
  for (let offset = 1; offset <= rows.length; offset++) {
    const nextIndex = (currentIndex + offset * direction + rows.length) % rows.length;
    if (rows[nextIndex]?.type !== 'heading') {
      return nextIndex;
    }
  }

  return currentIndex;
}

export function FrameworkSelectionScreen({
  frameworks,
  selectedFrameworkId,
  onSelect,
  onCancel,
}: FrameworkSelectionScreenProps) {
  const rows = useMemo<FrameworkRow[]>(() => {
    const defaultFramework = frameworks.find((framework) => framework.id === 'default') ?? null;
    const otherFrameworks = frameworks.filter((framework) => framework.id !== 'default');
    const nextRows: FrameworkRow[] = [];

    if (defaultFramework) {
      nextRows.push({
        type: 'heading',
        key: 'heading-default',
        label: 'Default framework',
      });
      nextRows.push({
        type: 'framework',
        key: `framework-${defaultFramework.id}`,
        framework: defaultFramework,
      });
    }

    if (otherFrameworks.length > 0) {
      nextRows.push({
        type: 'heading',
        key: 'heading-other',
        label: 'Other frameworks',
      });

      for (const framework of otherFrameworks) {
        nextRows.push({
          type: 'framework',
          key: `framework-${framework.id}`,
          framework,
        });
      }
    }

    return nextRows;
  }, [frameworks]);

  const [selectedIndex, setSelectedIndex] = useState(() =>
    getInitialSelectableIndex(rows, selectedFrameworkId)
  );

  useEffect(() => {
    setSelectedIndex(getInitialSelectableIndex(rows, selectedFrameworkId));
  }, [rows, selectedFrameworkId]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (input === 'k' || key.upArrow) {
      setSelectedIndex((currentIndex) => getNextSelectableIndex(rows, currentIndex, -1));
      return;
    }

    if (input === 'j' || key.downArrow) {
      setSelectedIndex((currentIndex) => getNextSelectableIndex(rows, currentIndex, 1));
      return;
    }

    if (!key.return) {
      return;
    }

    const selectedRow = rows[selectedIndex];
    if (!selectedRow) {
      return;
    }

    if (selectedRow.type === 'framework') {
      onSelect(selectedRow.framework);
    }
  });

  return (
    <ScreenLayout
      title="Choose a framework"
      step="Framework discovery"
      subtitle="Select which managed OpenCode framework should be installed globally."
      context={<Text dimColor>The installer will back up and replace the managed entries in ~/.config/opencode/.</Text>}
      footer={<KeyHints hints={[{ keyLabel: '↑/↓', description: 'move' }, { keyLabel: 'Enter', description: 'select' }, { keyLabel: 'Esc', description: 'cancel' }]} />}
    >
      <SectionCard title="Available frameworks">
        <Box flexDirection="column">
          {rows.map((row, index) => {
            if (row.type === 'heading') {
              return (
                <Box key={row.key} marginTop={row.key === 'heading-other' ? 1 : 0}>
                  <Text dimColor>{row.label}</Text>
                </Box>
              );
            }

            const isSelected = index === selectedIndex;
            const label = `${row.framework.name} (${row.framework.id})`;
            const displayLabel = row.framework.id;

            return (
              <Box key={row.key}>
                <Box marginRight={1}>
                  <Text color={isSelected ? uiColors.selected : undefined}>{isSelected ? '>' : ' '}</Text>
                </Box>
                <Text color={isSelected ? uiColors.accent : undefined} dimColor={!isSelected}>
                  {displayLabel}
                </Text>
              </Box>
            );
          })}
        </Box>
      </SectionCard>
    </ScreenLayout>
  );
}

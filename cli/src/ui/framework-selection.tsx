import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FrameworkDefinition, OpenCodeUpdateResult } from '../types/index.js';
import { KeyHints, ScreenLayout, SectionCard, StatusBanner } from './components/primitives.js';
import { uiColors } from './components/theme.js';

interface FrameworkSelectionScreenProps {
  frameworks: FrameworkDefinition[];
  selectedFrameworkId?: string | null;
  openCodeUpdateResult?: OpenCodeUpdateResult | null;
  onSelect: (framework: FrameworkDefinition) => void;
  onSkip: () => void;
  onCancel: () => void;
}

type FrameworkRow =
  | { type: 'heading'; key: string; label: string }
  | { type: 'framework'; key: string; framework: FrameworkDefinition }
  | { type: 'action'; key: string; label: string; value: 'skip' };

function getUpdateFeedback(result: OpenCodeUpdateResult): string {
  if (result.status === 'updated') {
    return `OpenCode updated${result.previousVersion ? ` from ${result.previousVersion}` : ''} to ${result.currentVersion || 'an updated detected version'}.`;
  }

  if (result.status === 'unchanged') {
    return `OpenCode update command completed, but the active binary version did not change${result.currentVersion ? ` (${result.currentVersion})` : ''}.`;
  }

  if (result.status === 'verification-mismatch') {
    return `OpenCode update ran via ${result.method}, but the active binary appears to come from ${result.activeInstallMethod || 'another installation'}.`;
  }

  if (result.status === 'unverified') {
    return 'OpenCode update command completed, but the CLI could not verify that it affected the active installation.';
  }

  if (result.status === 'skipped') {
    return `OpenCode update skipped. Current version: ${result.currentVersion || 'unknown'}.`;
  }

  return `OpenCode update failed. Current version: ${result.currentVersion || result.previousVersion || 'unknown'}.`;
}

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
  openCodeUpdateResult,
  onSelect,
  onSkip,
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

    nextRows.push({
      type: 'heading',
      key: 'heading-actions',
      label: 'Other actions',
    });
    nextRows.push({
      type: 'action',
      key: 'action-skip',
      label: 'Keep current framework',
      value: 'skip',
    });

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
      return;
    }

    if (selectedRow.type === 'action' && selectedRow.value === 'skip') {
      onSkip();
    }
  });

  return (
    <ScreenLayout
      title="Choose a framework"
      step="Framework discovery"
      subtitle="Select which managed OpenCode framework should be installed globally, or skip this step."
      context={
        <Box flexDirection="column">
          {openCodeUpdateResult && openCodeUpdateResult.status !== 'idle' && (
            <Box paddingBottom={1}>
              <StatusBanner
                tone={
                  openCodeUpdateResult.status === 'updated'
                    ? 'success'
                    : openCodeUpdateResult.status === 'failed' ||
                        openCodeUpdateResult.status === 'verification-mismatch'
                       ? 'danger'
                      : openCodeUpdateResult.status === 'unchanged' ||
                          openCodeUpdateResult.status === 'unverified'
                        ? 'warning'
                        : 'info'
                }
              >
                {getUpdateFeedback(openCodeUpdateResult)}
              </StatusBanner>
            </Box>
          )}
          <Text dimColor>You can finish after updating OpenCode without replacing the managed entries in ~/.config/opencode/.</Text>
        </Box>
      }
      footer={<KeyHints hints={[{ keyLabel: '↑/↓', description: 'move' }, { keyLabel: 'Enter', description: 'select' }, { keyLabel: 'Esc', description: 'cancel' }]} />}
    >
      <SectionCard title="Available frameworks">
        <Box flexDirection="column">
          {rows.map((row, index) => {
            if (row.type === 'heading') {
              return (
                <Box key={row.key} marginTop={row.key === 'heading-default' ? 0 : 1}>
                  <Text dimColor>{row.label}</Text>
                </Box>
              );
            }

            const isSelected = index === selectedIndex;
            if (row.type === 'action') {
              return (
                <Box key={row.key}>
                  <Box marginRight={1}>
                    <Text color={isSelected ? uiColors.selected : undefined}>{isSelected ? '>' : ' '}</Text>
                  </Box>
                  <Text color={isSelected ? uiColors.accent : undefined} dimColor={!isSelected}>
                    {row.label}
                  </Text>
                </Box>
              );
            }

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

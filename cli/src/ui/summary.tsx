import { Text, Box } from 'ink';
import React from 'react';
import type { BackupResult, InstallResult, OpenCodeUpdateResult, VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import {
  ScreenLayout,
  SectionCard,
} from './components/primitives.js';

interface SummaryScreenProps {
  frameworkName?: string | null;
  currentFrameworkName?: string | null;
  installResult: InstallResult;
  backupResult: BackupResult | null;
  openCodeUpdateResult?: OpenCodeUpdateResult | null;
  verifyResult: VerifyResult;
}

export function SummaryScreen({
  frameworkName,
  currentFrameworkName,
  installResult,
  backupResult,
  openCodeUpdateResult,
  verifyResult,
}: SummaryScreenProps) {
  const installIssues = installResult.errors.length > 0;
  const verificationIssues = verifyResult.errors.length > 0;
  const hasErrors = installIssues || verificationIssues;
  const configDir = getConfigDir();
  const isSuccess = installResult.status === 'success' && !hasErrors;
  const isSkipped = installResult.status === 'skipped' && !hasErrors;
  const title =
    isSkipped
      ? 'Run completed without framework changes'
      : isSuccess
      ? 'Installation successful!'
      : installResult.status === 'partial'
        ? 'Installation completed partially'
        : 'Installation completed with errors';
  const subtitle =
    isSkipped
      ? 'OpenCode was checked successfully and the framework installation step was skipped.'
      : isSuccess
      ? 'The managed OpenCode configuration has been installed successfully.'
      : installResult.status === 'partial'
        ? 'The install finished with recoverable issues. Review warnings and errors below.'
        : 'The setup finished with errors. Review the reported issues before retrying.';

  const runtimeUpdateLabel =
    openCodeUpdateResult?.status === 'success'
      ? openCodeUpdateResult.previousVersion &&
        openCodeUpdateResult.currentVersion &&
        openCodeUpdateResult.previousVersion === openCodeUpdateResult.currentVersion
        ? `already on ${openCodeUpdateResult.currentVersion}`
        : `completed via ${openCodeUpdateResult.method}${
            openCodeUpdateResult.previousVersion || openCodeUpdateResult.currentVersion
              ? ` (${openCodeUpdateResult.previousVersion || 'unknown'} -> ${openCodeUpdateResult.currentVersion || 'unknown'})`
              : ''
          }`
      : openCodeUpdateResult?.status === 'skipped'
        ? `skipped by user${openCodeUpdateResult.currentVersion ? ` (${openCodeUpdateResult.currentVersion})` : ''}`
        : openCodeUpdateResult?.status === 'failed'
          ? `failed via ${openCodeUpdateResult.method}${
              openCodeUpdateResult.currentVersion || openCodeUpdateResult.previousVersion
                ? ` (${openCodeUpdateResult.currentVersion || openCodeUpdateResult.previousVersion})`
                : ''
            }`
          : null;
  
  return (
    <ScreenLayout
      title={title}
      step="Run complete"
      subtitle={subtitle}
    >
      <Box paddingBottom={1}>
        <SectionCard title="Details">
          <Text>Config path: <Text color="cyan">{configDir}</Text></Text>
          {openCodeUpdateResult && openCodeUpdateResult.status !== 'idle' && (
            <Text>
              Runtime update:{' '}
              <Text dimColor>{runtimeUpdateLabel}</Text>
            </Text>
          )}
          {isSkipped && (
            <Text>
              Framework install: <Text dimColor>{currentFrameworkName || 'current framework unchanged'}</Text>
            </Text>
          )}
          {backupResult?.backupPath && (
            <Text>
              Backup path:{' '}
              <Text dimColor>
                {backupResult.backupPath}
                {backupResult.frameworkId ? ` (${backupResult.frameworkId})` : ''}
              </Text>
            </Text>
          )}
          <Text>
            Next step: <Text bold>opencode --version</Text>
          </Text>
        </SectionCard>
      </Box>

      {installIssues && (
        <Box paddingBottom={1}>
          <SectionCard title="Install errors">
            {installResult.errors.map((error) => (
              <Text key={error} color="red">- {error}</Text>
            ))}
          </SectionCard>
        </Box>
      )}

      {verifyResult.warnings.length > 0 && (
        <Box paddingBottom={1}>
          <SectionCard title="Warnings">
            {verifyResult.warnings.map((warning) => (
              <Text key={warning} color="yellow">- {warning}</Text>
            ))}
          </SectionCard>
        </Box>
      )}
      
      {verificationIssues && (
        <Box paddingBottom={1}>
          <SectionCard title="Verification errors">
            {verifyResult.errors.map((error) => (
              <Text key={error} color="red">- {error}</Text>
            ))}
          </SectionCard>
        </Box>
      )}
    </ScreenLayout>
  );
}

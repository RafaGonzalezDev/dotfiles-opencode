import { Text, Box } from 'ink';
import React from 'react';
import type { BackupResult, InstallResult, VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';
import {
  ScreenLayout,
  SectionCard,
} from './components/primitives.js';

interface SummaryScreenProps {
  frameworkName?: string | null;
  installResult: InstallResult;
  backupResult: BackupResult | null;
  verifyResult: VerifyResult;
}

export function SummaryScreen({
  frameworkName,
  installResult,
  backupResult,
  verifyResult,
}: SummaryScreenProps) {
  const installIssues = installResult.errors.length > 0;
  const verificationIssues = verifyResult.errors.length > 0;
  const hasErrors = installIssues || verificationIssues;
  const configDir = getConfigDir();
  const isSuccess = installResult.status === 'success' && !hasErrors;
  const title =
    isSuccess
      ? 'Installation successful!'
      : installResult.status === 'partial'
        ? 'Installation completed partially'
        : 'Installation completed with errors';
  const subtitle =
    isSuccess
      ? 'The managed OpenCode configuration has been installed successfully.'
      : installResult.status === 'partial'
        ? 'The install finished with recoverable issues. Review warnings and errors below.'
        : 'The setup finished with errors. Review the reported issues before retrying.';
  
  return (
    <ScreenLayout
      title={title}
      step="Run complete"
      subtitle={subtitle}
    >
      <Box paddingBottom={1}>
        <SectionCard title="Details">
          <Text>Config path: <Text color="cyan">{configDir}</Text></Text>
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

import { Text, Box } from 'ink';
import React from 'react';
import type { BackupResult, InstallResult, VerifyResult } from '../types/index.js';
import { getConfigDir } from '../utils/paths.js';

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
  const title =
    installResult.status === 'partial'
      ? 'Installation completed partially'
      : hasErrors
        ? 'Installation completed with errors'
        : 'Installation successful!';
  const titleColor =
    installResult.status === 'success' && !hasErrors ? 'green' : installResult.status === 'partial' ? 'yellow' : 'red';
  
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color={titleColor}>{title}</Text>
      </Box>
      
      <Box paddingBottom={1}>
        <Text>Files installed: {installResult.filesInstalled}</Text>
      </Box>

      {frameworkName && (
        <Box paddingBottom={1}>
          <Text>Framework: {frameworkName}</Text>
        </Box>
      )}
      
      {backupResult && backupResult.backupPath && (
        <Box paddingBottom={1}>
          <Text dimColor>Backup created at:</Text>
        </Box>
      )}
      {backupResult && backupResult.backupPath && (
        <Text dimColor>
          {'  '}
          {backupResult.backupPath}
          {backupResult.frameworkId ? ` (${backupResult.frameworkId})` : ''}
        </Text>
      )}

      <Box paddingTop={1}>
        <Text dimColor>Configuration available at:</Text>
      </Box>
      <Text dimColor>  {configDir}</Text>
      
      {installIssues && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color="red">Install errors:</Text>
          {installResult.errors.map((error) => (
            <Text key={error} color="red" dimColor>  - {error}</Text>
          ))}
        </Box>
      )}

      {verifyResult.warnings.length > 0 && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color="yellow">Warnings:</Text>
          {verifyResult.warnings.map((warning) => (
            <Text key={warning} color="yellow" dimColor>  - {warning}</Text>
          ))}
        </Box>
      )}
      
      {verificationIssues && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color="red">Verification errors:</Text>
          {verifyResult.errors.map((error) => (
            <Text key={error} color="red" dimColor>  - {error}</Text>
          ))}
        </Box>
      )}
      
      <Box paddingTop={2}>
        <Text>Next step: Run </Text>
        <Text bold>'opencode --version'</Text>
        <Text> to verify</Text>
      </Box>
    </Box>
  );
}

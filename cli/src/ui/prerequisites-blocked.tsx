import React from 'react';
import { Box, Text } from 'ink';
import type { CheckResult } from '../types/index.js';

interface PrerequisitesBlockedScreenProps {
  failures: CheckResult[];
}

function getSuggestion(failure: CheckResult): string {
  switch (failure.name) {
    case 'Node.js':
      return 'Install Node.js 18+ and npm, then rerun the setup.';
    case 'npm':
      return 'Install npm (usually bundled with Node.js) and rerun the setup.';
    case 'Git':
      return 'Install Git and rerun the setup.';
    default:
      return 'Resolve the missing prerequisite and rerun the setup.';
  }
}

export function PrerequisitesBlockedScreen({
  failures,
}: PrerequisitesBlockedScreenProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text bold color="red">Missing required prerequisites</Text>
      </Box>

      <Text>The setup cannot continue until these issues are fixed:</Text>

      <Box flexDirection="column" paddingTop={1}>
        {failures.map((failure) => (
          <Box key={failure.name} flexDirection="column" paddingBottom={1}>
            <Text color="red">- {failure.name}: {failure.message}</Text>
            <Text dimColor>  {getSuggestion(failure)}</Text>
          </Box>
        ))}
      </Box>

      <Box paddingTop={1}>
        <Text dimColor>After fixing them, run the installer again.</Text>
      </Box>
    </Box>
  );
}

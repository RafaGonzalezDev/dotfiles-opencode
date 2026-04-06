import { Text, Box } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

interface InstallationProgressScreenProps {
  phase: string;
  messages: string[];
}

export function InstallationProgressScreen({ phase, messages }: InstallationProgressScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [messages]);
  
  return (
    <Box flexDirection="column" padding={1}>
      <Box paddingBottom={1}>
        <Text><Spinner /> {phase}</Text>
      </Box>
      
      <Text dimColor>{messages[currentMessageIndex]}</Text>
    </Box>
  );
}

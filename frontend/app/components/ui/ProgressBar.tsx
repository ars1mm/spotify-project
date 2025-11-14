'use client';

import { Box } from '@chakra-ui/react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <Box flex="1" h="4px" bg="#535353" borderRadius="full" position="relative">
      <Box w={`${progress}%`} h="full" bg="white" borderRadius="full" />
    </Box>
  );
}
'use client';

import { Box, Button } from '@chakra-ui/react';
import { FiVolume2 } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';

export function VolumeControl() {
  return (
    <Box display="flex" alignItems="center" gap={2} flex="1" justifyContent="flex-end">
      <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }}>
        <FiVolume2 />
      </Button>
      <Box w="100px">
        <ProgressBar progress={70} />
      </Box>
    </Box>
  );
}
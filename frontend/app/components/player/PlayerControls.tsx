'use client';

import { Box, Text, Button } from '@chakra-ui/react';
import { FiPlay, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';

export function PlayerControls() {
  return (
    <Box flex="2" maxW="722px">
      <Box display="flex" justifyContent="center" alignItems="center" gap={4} mb={2}>
        <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }}>
          <FiSkipBack />
        </Button>
        <Button
          variant="ghost"
          color="black"
          bg="white"
          _hover={{ bg: 'gray.200' }}
          borderRadius="full"
          size="lg"
        >
          <FiPlay />
        </Button>
        <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }}>
          <FiSkipForward />
        </Button>
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text color="#B3B3B3" fontSize="xs">0:00</Text>
        <ProgressBar progress={30} />
        <Text color="#B3B3B3" fontSize="xs">3:45</Text>
      </Box>
    </Box>
  );
}
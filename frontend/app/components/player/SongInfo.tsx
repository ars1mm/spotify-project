'use client';

import { Box, Text, Button } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';

export function SongInfo() {
  return (
    <Box display="flex" alignItems="center" gap={4} flex="1">
      <Box w="56px" h="56px" bg="gray.500" borderRadius="md" />
      <Box>
        <Text color="white" fontWeight="medium">Song Name</Text>
        <Text color="#B3B3B3" fontSize="sm">Artist Name</Text>
      </Box>
      <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }}>
        <FiHeart />
      </Button>
    </Box>
  );
}
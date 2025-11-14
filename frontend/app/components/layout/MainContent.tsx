'use client';

import { Box, Text, SimpleGrid, VStack } from '@chakra-ui/react';

const playlists = [
  { id: 1, name: 'Today\'s Top Hits', image: '/placeholder.jpg' },
  { id: 2, name: 'RapCaviar', image: '/placeholder.jpg' },
  { id: 3, name: 'All Out 2010s', image: '/placeholder.jpg' },
  { id: 4, name: 'Rock Classics', image: '/placeholder.jpg' },
  { id: 5, name: 'Chill Hits', image: '/placeholder.jpg' },
  { id: 6, name: 'Pop Rising', image: '/placeholder.jpg' },
];

export function MainContent() {
  return (
    <Box flex="1" bg="#121212" p={8} overflowY="auto">
      <VStack align="start" spacing={8}>
        <Text fontSize="3xl" fontWeight="bold" color="white">
          Good evening
        </Text>
        
        <VStack align="start" spacing={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Made for you
          </Text>
          <SimpleGrid columns={3} spacing={6} w="full">
            {playlists.map((playlist) => (
              <Box
                key={playlist.id}
                bg="#535353"
                p={4}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.600' }}
                transition="all 0.2s"
              >
                <VStack spacing={3}>
                  <Box
                    w="150px"
                    h="150px"
                    bg="gray.500"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize="sm">
                      {playlist.name}
                    </Text>
                  </Box>
                  <Text color="white" fontWeight="medium" textAlign="center">
                    {playlist.name}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </VStack>
    </Box>
  );
}
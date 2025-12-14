'use client';

import { Box, Text, Button } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';

export function SongInfo() {
  const { currentSong } = usePlayer();

  if (!currentSong) {
    return (
      <Box display="flex" alignItems="center" gap={4} flex="1">
        <Box w="56px" h="56px" bg="gray.500" borderRadius="md" />
        <Box>
          <Text color="#B3B3B3" fontWeight="medium">No song playing</Text>
          <Text color="#B3B3B3" fontSize="sm">Select a song to play</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={4} flex="1">
      <Box w="56px" h="56px" bg="gray.500" borderRadius="md" overflow="hidden">
        {currentSong.cover_image_url ? (
          <img 
            src={currentSong.cover_image_url} 
            alt={currentSong.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box w="full" h="full" bg="gray.500" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="lg">♪</Text>
          </Box>
        )}
      </Box>
      <Box>
        <Text color="white" fontWeight="medium">{currentSong.title}</Text>
        <Text color="#B3B3B3" fontSize="sm">{currentSong.artist}</Text>
      </Box>
      <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }}>
        <FiHeart />
      </Button>
    </Box>
  );
}
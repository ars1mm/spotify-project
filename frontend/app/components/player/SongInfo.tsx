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
    <Box display="flex" alignItems="center" gap={{ base: 2, md: 4 }} flex="1" minW="0">
      <Box w={{ base: "40px", md: "56px" }} h={{ base: "40px", md: "56px" }} bg="gray.500" borderRadius="md" overflow="hidden" flexShrink={0}>
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
      <Box flex="1" minW="0" maxW={{ base: "120px", md: "200px" }}>
        <Text 
          color="white" 
          fontWeight="medium"
          fontSize={{ base: "sm", md: "md" }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {currentSong.title}
        </Text>
        <Text 
          color="#B3B3B3" 
          fontSize={{ base: "xs", md: "sm" }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {currentSong.artist}
        </Text>
      </Box>
      <Button display={{ base: "none", md: "flex" }} variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }} flexShrink={0}>
        <FiHeart />
      </Button>
    </Box>
  );
}
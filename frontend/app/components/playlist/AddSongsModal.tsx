import { Box, Flex, Text, Button, VStack, Input, Image } from '@chakra-ui/react';
import { useState } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_image_url?: string;
}

interface AddSongsModalProps {
  isOpen: boolean;
  allSongs: Song[];
  playlistSongs: Song[];
  onClose: () => void;
  onAddSong: (songId: string) => void;
}

export function AddSongsModal({ 
  isOpen, 
  allSongs, 
  playlistSongs, 
  onClose, 
  onAddSong 
}: AddSongsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSongs = allSongs
    .filter(song => 
      !playlistSongs.find(s => s.id === song.id) &&
      (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0,0,0,0.8)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="#282828"
        borderRadius="8px"
        p={6}
        maxW="500px"
        w="90%"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Add Songs
          </Text>
        </Flex>
        
        <VStack gap={4} align="stretch" maxH="400px" overflowY="auto">
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="#3e3e3e"
            border="none"
            color="white"
          />
          
          {filteredSongs.map(song => (
            <Flex
              key={song.id}
              align="center"
              gap={3}
              p={2}
              bg="#3e3e3e"
              borderRadius="4px"
              _hover={{ bg: '#4e4e4e' }}
              cursor="pointer"
              onClick={() => onAddSong(song.id)}
            >
              <Box w="40px" h="40px" bg="#282828" borderRadius="4px" flexShrink={0}>
                {song.cover_image_url ? (
                  <Image 
                    src={song.cover_image_url} 
                    alt={song.title} 
                    w="40px"
                    h="40px"
                    borderRadius="4px"
                    objectFit="cover"
                  />
                ) : (
                  <Flex align="center" justify="center" h="full">
                    <Text color="#a7a7a7" fontSize="12px">♪</Text>
                  </Flex>
                )}
              </Box>
              
              <Box flex="1" minW="0">
                <Text
                  color="white"
                  fontSize="14px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {song.title}
                </Text>
                <Text
                  color="#a7a7a7"
                  fontSize="12px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {song.artist}
                </Text>
              </Box>
            </Flex>
          ))}
        </VStack>
        
        <Flex gap={3} mt={6} justify="flex-end">
          <Button
            onClick={onClose}
            bg="transparent"
            color="white"
            _hover={{ bg: '#3e3e3e' }}
          >
            Back
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
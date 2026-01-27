import { VStack, Box, Text, Button, Flex } from '@chakra-ui/react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  cover_image_url?: string;
}

interface SongListProps {
  songs: Song[];
  currentUserId?: string;
  playlistUserId: string;
  onSongClick: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
}

export function SongList({ songs, currentUserId, playlistUserId, onSongClick, onRemoveSong }: SongListProps) {
  if (songs.length === 0) {
    return <Text color="#a7a7a7">No songs in this playlist yet.</Text>;
  }

  return (
    <VStack align="start" gap={0} w="full">
      {songs.map((song, index) => (
        <Box
          key={song.id}
          display="flex"
          alignItems="center"
          p={2}
          w="full"
          _hover={{ bg: '#1a1a1a' }}
          borderRadius="4px"
          cursor="pointer"
          transition="all 0.1s ease"
          onClick={() => onSongClick(song)}
        >
          <Text color="#a7a7a7" fontSize="16px" w="40px" textAlign="center">
            {index + 1}
          </Text>
          
          <Box
            w="40px"
            h="40px"
            bg="#282828"
            borderRadius="4px"
            mr={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {song.cover_image_url ? (
              <img
                src={song.cover_image_url}
                alt={song.title}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Text color="#a7a7a7" fontSize="12px">♪</Text>
            )}
          </Box>
          
          <Box flex="1" minW="0" maxW={{ base: "none", md: "300px" }}>
            <Text
              color="white"
              fontWeight="400"
              fontSize="16px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {song.title}
            </Text>
            <Text
              color="#a7a7a7"
              fontSize="14px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {song.artist}
            </Text>
          </Box>
          
          <Text
            color="#a7a7a7"
            fontSize="14px"
            mr={4}
            minW="200px"
            display={{ base: "none", md: "block" }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {song.album && song.album !== 'Unknown' ? song.album : song.artist}
          </Text>
          
          <Text
            color="#a7a7a7"
            fontSize="14px"
            minW="60px"
            textAlign="right"
            display={{ base: "none", md: "block" }}
            mr={4}
          >
            {song.duration_seconds
              ? `${Math.floor(song.duration_seconds / 60)}:${(song.duration_seconds % 60)
                  .toString()
                  .padStart(2, '0')}`
              : '--:--'}
          </Text>
          
          {currentUserId === playlistUserId && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Remove this song from playlist?')) {
                  onRemoveSong(song.id);
                }
              }}
              bg="transparent"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              color="#a7a7a7"
              size="sm"
              minW="auto"
              p={1}
            >
              <Text fontSize="18px">✕</Text>
            </Button>
          )}
        </Box>
      ))}
    </VStack>
  );
}
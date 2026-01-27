import { Box, Flex, Text, Button } from '@chakra-ui/react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_image_url?: string;
  duration_seconds?: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  user_id: string;
  users?: { name: string };
}

interface PlaylistHeaderProps {
  playlist: Playlist;
  songs: Song[];
  currentUserId?: string;
  onSettingsClick: () => void;
}

export function PlaylistHeader({ playlist, songs, currentUserId, onSettingsClick }: PlaylistHeaderProps) {
  const totalSeconds = songs.reduce((acc, song) => acc + (song.duration_seconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const duration = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

  return (
    <Flex gap={6} align="end" w="full">
      <Box
        w={{ base: "160px", md: "232px" }}
        h={{ base: "160px", md: "232px" }}
        bg="#282828"
        borderRadius="8px"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 4px 60px rgba(0,0,0,.5)"
      >
        {songs.length > 0 && songs[0].cover_image_url ? (
          <img
            src={songs[0].cover_image_url}
            alt={playlist.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Text color="#a7a7a7" fontSize="48px">♪</Text>
        )}
      </Box>
      
      <Box flex="1" pb={4}>
        <Flex align="center" justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="bold" color="white" textTransform="uppercase">
            Playlist
          </Text>
          {currentUserId === playlist.user_id && (
            <Button
              onClick={onSettingsClick}
              bg="#1db954"
              _hover={{ bg: '#1ed760' }}
              color="white"
              size="sm"
            >
              Settings
            </Button>
          )}
        </Flex>
        
        <Text fontSize={{ base: "2xl", md: "5xl" }} fontWeight="bold" color="white">
          {playlist.name}
        </Text>
        
        {playlist.description && (
          <Text color="#a7a7a7" mt={2}>
            {playlist.description}
          </Text>
        )}
        
        <Flex align="center" gap={1} fontSize="sm" mt={2}>
          {playlist.users?.name && (
            <Text color="white" fontWeight="bold">
              {playlist.users.name}
            </Text>
          )}
          {playlist.users?.name && <Text color="#a7a7a7">•</Text>}
          <Text color="#a7a7a7">
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </Text>
          {songs.length > 0 && (
            <>
              <Text color="#a7a7a7">•</Text>
              <Text color="#a7a7a7">{duration}</Text>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
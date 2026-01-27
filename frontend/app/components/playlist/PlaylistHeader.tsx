import { Box, Flex, Text } from '@chakra-ui/react';
import { Song, Playlist } from '../../types';
import { formatPlaylistDuration } from '../../utils';
import { PrimaryButton } from '../ui/Buttons';
import { CoverImage } from '../ui/CoverImage';
import { APP_CONSTANTS } from '../../constants';

interface PlaylistHeaderProps {
  playlist: Playlist;
  songs: Song[];
  currentUserId?: string;
  onSettingsClick: () => void;
}

export function PlaylistHeader({ playlist, songs, currentUserId, onSettingsClick }: PlaylistHeaderProps) {
  const totalSeconds = songs.reduce((acc, song) => acc + (song.duration_seconds || 0), 0);
  const duration = formatPlaylistDuration(totalSeconds);

  return (
    <Flex gap={6} align="end" w="full">
      <CoverImage
        src={songs.length > 0 ? songs[0].cover_image_url : undefined}
        alt={playlist.name}
        size="md"
      />
      
      <Box flex="1" pb={4}>
        <Flex align="center" justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="bold" color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} textTransform="uppercase">
            Playlist
          </Text>
          {currentUserId === playlist.user_id && (
            <PrimaryButton
              onClick={onSettingsClick}
              size="sm"
            >
              Settings
            </PrimaryButton>
          )}
        </Flex>
        
        <Text fontSize={{ base: "2xl", md: "5xl" }} fontWeight="bold" color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}>
          {playlist.name}
        </Text>
        
        {playlist.description && (
          <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} mt={2}>
            {playlist.description}
          </Text>
        )}
        
        <Flex align="center" gap={1} fontSize="sm" mt={2}>
          {playlist.users?.name && (
            <Text color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} fontWeight="bold">
              {playlist.users.name}
            </Text>
          )}
          {playlist.users?.name && <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}>•</Text>}
          <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}>
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </Text>
          {songs.length > 0 && (
            <>
              <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}>•</Text>
              <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}>{duration}</Text>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
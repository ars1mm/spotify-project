import { Box, Text } from '@chakra-ui/react';
import { Song } from '../../types';
import { formatDuration } from '../../utils';
import { LazyImage } from './LazyImage';
import { SecondaryButton } from './Buttons';
import { APP_CONSTANTS } from '../../constants';
import { memo } from 'react';

interface SongItemProps {
  song: Song;
  index?: number;
  showRemove?: boolean;
  onClick: (song: Song) => void;
  onRemove?: (songId: string) => void;
}

export const SongItem = memo(({ song, index, showRemove, onClick, onRemove }: SongItemProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this song from playlist?')) {
      onRemove?.(song.id);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      p={2}
      w="full"
      _hover={{ bg: '#1a1a1a' }}
      borderRadius="4px"
      cursor="pointer"
      transition="all 0.1s ease"
      onClick={() => onClick(song)}
    >
      {index !== undefined && (
        <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} fontSize="16px" w="40px" textAlign="center">
          {index + 1}
        </Text>
      )}
      
      <Box mr={3}>
        <LazyImage
          src={song.cover_image_url}
          alt={song.title}
          size="sm"
        />
      </Box>
      
      <Box flex="1" minW="0" maxW={{ base: "none", md: "300px" }}>
        <Text
          color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}
          fontWeight="400"
          fontSize="16px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {song.title}
        </Text>
        <Text
          color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
          fontSize="14px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {song.artist}
        </Text>
      </Box>
      
      <Text
        color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
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
        color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        fontSize="14px"
        minW="60px"
        textAlign="right"
        display={{ base: "none", md: "block" }}
        mr={4}
      >
        {song.duration_seconds ? formatDuration(song.duration_seconds) : '--:--'}
      </Text>
      
      {showRemove && (
        <SecondaryButton
          onClick={handleRemove}
          _hover={{ bg: 'rgba(255,255,255,0.1)' }}
          size="sm"
          minW="auto"
          p={1}
        >
          <Text fontSize="18px">✕</Text>
        </SecondaryButton>
      )}
    </Box>
  );
});

SongItem.displayName = 'SongItem';
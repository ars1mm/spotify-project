import { VStack, Text } from '@chakra-ui/react';
import { Song } from '../../types';
import { SongItem } from '../ui/SongItem';
import { APP_CONSTANTS } from '../../constants';

interface SongListProps {
  songs: Song[];
  currentUserId?: string;
  playlistUserId: string;
  onSongClick: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
}

export function SongList({ songs, currentUserId, playlistUserId, onSongClick, onRemoveSong }: SongListProps) {
  if (songs.length === 0) {
    return <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}>No songs in this playlist yet.</Text>;
  }

  return (
    <VStack align="start" gap={0} w="full">
      {songs.map((song, index) => (
        <SongItem
          key={song.id}
          song={song}
          index={index}
          showRemove={currentUserId === playlistUserId}
          onClick={onSongClick}
          onRemove={onRemoveSong}
        />
      ))}
    </VStack>
  );
}
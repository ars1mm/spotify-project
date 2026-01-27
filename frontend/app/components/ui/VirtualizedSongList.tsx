import { memo, useMemo } from 'react';
import { List } from 'react-window';
import { Box } from '@chakra-ui/react';
import { Song } from '../../types';
import { SongItem } from '../ui/SongItem';

interface VirtualizedSongListProps {
  songs: Song[];
  height: number;
  currentUserId?: string;
  playlistUserId?: string;
  onSongClick: (song: Song) => void;
  onRemoveSong?: (songId: string) => void;
}

interface SongRowData {
  songs: Song[];
  currentUserId?: string;
  playlistUserId?: string;
  onSongClick: (song: Song) => void;
  onRemoveSong?: (songId: string) => void;
}

interface SongRowProps extends SongRowData {
  index: number;
  style: React.CSSProperties;
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
}

const ITEM_HEIGHT = 64;

const SongRow = ({ index, style, songs, currentUserId, playlistUserId, onSongClick, onRemoveSong }: SongRowProps) => {
  const song = songs[index];

  if (!song) return null;

  return (
    <div style={style}>
      <SongItem
        song={song}
        index={index}
        showRemove={currentUserId === playlistUserId}
        onClick={onSongClick}
        onRemove={onRemoveSong}
      />
    </div>
  );
};

export const VirtualizedSongList = memo(({
  songs,
  height,
  currentUserId,
  playlistUserId,
  onSongClick,
  onRemoveSong
}: VirtualizedSongListProps) => {
  const rowData: SongRowData = useMemo(() => ({
    songs,
    currentUserId,
    playlistUserId,
    onSongClick,
    onRemoveSong
  }), [songs, currentUserId, playlistUserId, onSongClick, onRemoveSong]);

  if (songs.length === 0) {
    return <Box p={4} color="gray.500">No songs available</Box>;
  }

  return (
    <List
      style={{ height }}
      rowCount={songs.length}
      rowHeight={ITEM_HEIGHT}
      rowComponent={SongRow}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - react-window type complexity workaround
      rowProps={rowData}
      overscanCount={5}
    />
  );
});

VirtualizedSongList.displayName = 'VirtualizedSongList';
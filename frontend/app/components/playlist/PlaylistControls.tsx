import { Flex, Button } from '@chakra-ui/react';
import { FiPlay, FiShuffle } from 'react-icons/fi';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface PlaylistControlsProps {
  songs: Song[];
  isShuffled: boolean;
  onPlay: (songs: Song[]) => void;
  onShuffleToggle: () => void;
}

export function PlaylistControls({ songs, isShuffled, onPlay, onShuffleToggle }: PlaylistControlsProps) {
  const handlePlay = () => {
    if (songs.length > 0) {
      const playlistSongs = isShuffled ? [...songs].sort(() => Math.random() - 0.5) : songs;
      localStorage.setItem('currentPlaylist', JSON.stringify(playlistSongs));
      onPlay(playlistSongs);
    }
  };

  return (
    <Flex gap={4} mb={4} align="center">
      <Button
        bg="#1db954"
        color="white"
        _hover={{ bg: '#1ed760', transform: 'scale(1.05)' }}
        size="lg"
        borderRadius="full"
        onClick={handlePlay}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <FiPlay />
        Play
      </Button>
      
      <Button
        bg={isShuffled ? '#1db954' : 'transparent'}
        border={isShuffled ? 'none' : '1px solid #535353'}
        color="white"
        _hover={{ bg: isShuffled ? '#1ed760' : '#282828', borderColor: '#b3b3b3' }}
        size="lg"
        borderRadius="full"
        onClick={onShuffleToggle}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <FiShuffle />
        {isShuffled ? 'Shuffled' : 'Shuffle'}
      </Button>
    </Flex>
  );
}
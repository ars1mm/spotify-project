import { Box, VStack, Text, Spinner, Button } from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { useSongs } from '../hooks/useSongs';
import { VirtualizedSongList } from '../components/ui/VirtualizedSongList';
import { usePlayer } from '../contexts/PlayerContext';
import { authStorage } from '../lib/auth';
import { Song } from '../types';
import toast from 'react-hot-toast';

export default function OptimizedSongsPage() {
  const { playSong } = usePlayer();
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const { songs, loading, hasMore, loadMore, refresh } = useSongs({ 
    limit: 20, 
    enableCache: true 
  });

  const handleSongClick = useCallback((song: Song) => {
    if (!isAuthenticated) {
      toast.error('Please log in to play songs');
      return;
    }
    playSong(song);
  }, [isAuthenticated, playSong]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  if (loading && songs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  return (
    <VStack align="start" gap={4} w="full" h="100vh">
      <Box display="flex" justifyContent="space-between" alignItems="center" w="full">
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Songs ({songs.length})
        </Text>
        <Button onClick={refresh} size="sm" colorScheme="green">
          Refresh
        </Button>
      </Box>

      <Box 
        w="full" 
        flex="1" 
        onScroll={handleScroll}
        overflowY="auto"
      >
        <VirtualizedSongList
          songs={songs}
          height={600}
          onSongClick={handleSongClick}
        />
        
        {loading && songs.length > 0 && (
          <Box display="flex" justifyContent="center" p={4}>
            <Spinner color="green.500" />
          </Box>
        )}
        
        {!hasMore && songs.length > 0 && (
          <Text textAlign="center" color="gray.500" p={4}>
            No more songs to load
          </Text>
        )}
      </Box>
    </VStack>
  );
}
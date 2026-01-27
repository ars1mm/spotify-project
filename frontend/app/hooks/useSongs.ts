import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../config/api';
import { Song } from '../types';

interface UseSongsOptions {
  limit?: number;
  enableCache?: boolean;
  lazy?: boolean;
}

const songCache = new Map<string, { data: Song[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSongs({ limit = 20, enableCache = true, lazy = false }: UseSongsOptions = {}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(!lazy);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const cacheKey = `songs-${limit}`;

  const loadSongs = useCallback(async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);

    // Check cache first
    if (enableCache && pageNum === 1) {
      const cached = songCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSongs(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await apiRequest(`/api/v1/songs?page=${pageNum}&limit=${limit}`);
      const newSongs = response.songs || [];
      
      if (append) {
        setSongs(prev => [...prev, ...newSongs]);
      } else {
        setSongs(newSongs);
        // Cache first page
        if (enableCache && pageNum === 1) {
          songCache.set(cacheKey, { data: newSongs, timestamp: Date.now() });
        }
      }
      
      setHasMore(newSongs.length === limit);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  }, [limit, enableCache, cacheKey]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSongs(nextPage, true);
    }
  }, [loading, hasMore, page, loadSongs]);

  const refresh = useCallback(() => {
    songCache.delete(cacheKey);
    setPage(1);
    loadSongs(1, false);
  }, [cacheKey, loadSongs]);

  useEffect(() => {
    if (!lazy) {
      loadSongs();
    }
  }, [loadSongs, lazy]);

  return {
    songs,
    loading,
    hasMore,
    loadMore,
    refresh,
    loadSongs: () => loadSongs(1, false)
  };
}
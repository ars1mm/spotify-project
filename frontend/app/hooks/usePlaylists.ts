import { useState, useEffect } from 'react';
import { authStorage } from '../lib/auth';
import { playlistApi } from '../lib/api';
import { Playlist } from '../types';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlaylists = async () => {
    const session = authStorage.getSession();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await playlistApi.getAll(session.user.id);
      const userPlaylists = (response.playlists || []).filter((playlist: Playlist) => playlist.user_id === session.user.id);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
    
    const handlePlaylistsChanged = () => {
      loadPlaylists();
    };
    
    window.addEventListener('playlistsChanged', handlePlaylistsChanged);
    
    return () => {
      window.removeEventListener('playlistsChanged', handlePlaylistsChanged);
    };
  }, []);

  return { playlists, loading, loadPlaylists };
}
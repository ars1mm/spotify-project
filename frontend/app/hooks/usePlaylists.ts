import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { authStorage } from '../lib/auth';

interface Playlist {
  id: string;
  name: string;
  is_public: boolean;
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlaylists = async () => {
    const session = authStorage.getSession();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await apiRequest(`/api/v1/playlists?user_id=${session.user.id}`);
      setPlaylists(response.playlists || []);
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
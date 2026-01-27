import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiRequest } from '../config/api';
import { authStorage } from '../lib/auth';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  cover_image_url?: string;
  audio_url?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  users?: { name: string };
}

export function usePlaylistPage() {
  const params = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const currentUserId = authStorage.getUser()?.id;

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/api/v1/playlists/${playlistId}`);
      setPlaylist(response.playlist);
      setSongs(response.songs || []);
    } catch (error) {
      console.error('Failed to load playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSongs = async () => {
    try {
      const response = await apiRequest('/api/v1/songs?page=1&limit=100');
      setAllSongs(response.songs || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  };

  const updatePlaylist = async (name: string, description: string, isPublic: boolean) => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, is_public: isPublic })
      });
      toast.success('Playlist updated');
      loadPlaylist(params.id as string);
    } catch (error) {
      toast.error('Failed to update playlist');
    }
  };

  const addSong = async (songId: string) => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}/songs/${songId}`, { method: 'POST' });
      toast.success('Song added');
      loadPlaylist(params.id as string);
    } catch (error) {
      toast.error('Failed to add song');
    }
  };

  const removeSong = async (songId: string) => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}/songs/${songId}`, { method: 'DELETE' });
      toast.success('Song removed');
      loadPlaylist(params.id as string);
    } catch (error) {
      toast.error('Failed to remove song');
    }
  };

  useEffect(() => {
    if (params.id) {
      loadPlaylist(params.id as string);
    }
  }, [params.id]);

  return {
    playlist,
    songs,
    loading,
    allSongs,
    currentUserId,
    loadAllSongs,
    updatePlaylist,
    addSong,
    removeSong
  };
}
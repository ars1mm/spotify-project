import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { authStorage } from '../lib/auth';
import { playlistApi, songApi } from '../lib/api';
import { Song, Playlist } from '../types';

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
      const response = await playlistApi.getById(playlistId);
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
      const response = await songApi.getAll(1, 100);
      setAllSongs(response.songs || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  };

  const updatePlaylist = async (name: string, description: string, isPublic: boolean) => {
    try {
      await playlistApi.update(params.id as string, { name, description, is_public: isPublic });
      toast.success('Playlist updated');
      loadPlaylist(params.id as string);
    } catch {
      toast.error('Failed to update playlist');
    }
  };

  const addSong = async (songId: string) => {
    try {
      await playlistApi.addSong(params.id as string, songId);
      toast.success('Song added');
      loadPlaylist(params.id as string);
    } catch {
      toast.error('Failed to add song');
    }
  };

  const removeSong = async (songId: string) => {
    try {
      await playlistApi.removeSong(params.id as string, songId);
      toast.success('Song removed');
      loadPlaylist(params.id as string);
    } catch {
      toast.error('Failed to remove song');
    }
  };

  const deletePlaylist = async (userId: string) => {
    try {
      await playlistApi.delete(params.id as string, userId);
      return true;
    } catch {
      toast.error('Failed to delete playlist');
      return false;
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
    deletePlaylist,
    addSong,
    removeSong
  };
}
/*
 * USE PLAYLISTS HOOK - HOOK PËR MENAXHIMIN E PLAYLIST-EVE
 * 
 * Custom hook për menaxhimin e playlist-eve të përdoruesit.
 * Ofron loading state dhe auto-refresh functionality.
 * 
 * Funksionaliteti:
 * - Ngarkon playlist-et e përdoruesit aktual
 * - Filtron vetëm playlist-et e përdoruesit
 * - Dëgjon për ndryshime (playlistsChanged event)
 * - Ofron loading state për UI
 * 
 * Return values:
 * - playlists: Lista e playlist-eve
 * - loading: Statusi i loading-ut
 * - loadPlaylists: Funksioni për rifreskim manual
 * 
 * Event handling:
 * - Regjistron listener për 'playlistsChanged'
 * - Pastron listener-in në unmount
 */
import { useState, useEffect } from 'react';
import { authStorage } from '../lib/auth';
import { playlistApi } from '../lib/api';
import { Playlist } from '../types';

/*
 * MAIN HOOK FUNCTION - FUNKSIONI KRYESOR I HOOK-UT
 * 
 * Implementon logjikën e menaxhimit të playlist-eve:
 * 1. Kontrollon autentifikimin e përdoruesit
 * 2. Ngarkon playlist-et nga API
 * 3. Filtron vetëm playlist-et e përdoruesit aktual
 * 4. Menaxhon loading state dhe error handling
 */
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
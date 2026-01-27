import { apiRequest } from '../config/api';
// import { Playlist, Song } from '../types';

export const playlistApi = {
  getAll: (userId?: string) => 
    apiRequest(`/api/v1/playlists${userId ? `?user_id=${userId}` : ''}`),
  
  getById: (id: string) => 
    apiRequest(`/api/v1/playlists/${id}`),
  
  create: (data: { name: string; description: string; is_public: boolean; user_id: string; song_ids?: string[] }) =>
    apiRequest('/api/v1/playlists', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: { name?: string; description?: string; is_public?: boolean }) =>
    apiRequest(`/api/v1/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string, userId: string) =>
    apiRequest(`/api/v1/playlists/${id}?user_id=${userId}`, { method: 'DELETE' }),
  
  addSong: (playlistId: string, songId: string) =>
    apiRequest(`/api/v1/playlists/${playlistId}/songs/${songId}`, { method: 'POST' }),
  
  removeSong: (playlistId: string, songId: string) =>
    apiRequest(`/api/v1/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' })
};

export const songApi = {
  getAll: (page = 1, limit = 50) => 
    apiRequest(`/api/v1/songs?page=${page}&limit=${limit}`),
  
  search: (query: string, limit = 10) =>
    apiRequest(`/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  getLiked: (userId: string) =>
    apiRequest(`/api/v1/songs/liked?user_id=${userId}`),
  
  like: (songId: string, userId: string) =>
    apiRequest(`/api/v1/songs/${songId}/like?user_id=${userId}`, { method: 'POST' }),
  
  unlike: (songId: string, userId: string) =>
    apiRequest(`/api/v1/songs/${songId}/like?user_id=${userId}`, { method: 'DELETE' })
};
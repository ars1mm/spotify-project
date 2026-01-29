/*
 * API FUNCTIONS - PLAYLIST DHE SONG MANAGEMENT
 * 
 * Ky skedar përmban të gjitha funksionet për komunikim me backend API.
 * Përdor apiRequest për të bërë thirrje HTTP dhe menaxhon të dhënat.
 * 
 * Komponentët kryesorë:
 * - playlistApi: Operacionet CRUD për playlist-et
 * - songApi: Operacionet për këngët dhe kërkimin
 * 
 * Raste përdorimi:
 * - Krijimi, leximi, përditësimi dhe fshirja e playlist-eve
 * - Kërkimi dhe menaxhimi i këngëve
 * - Shtimi/heqja e këngëve nga playlist-et
 */
import { apiRequest } from '../config/api';
// import { Playlist, Song } from '../types';

/*
 * PLAYLIST API - MENAXHIMI I PLAYLIST-EVE
 * 
 * Përmban të gjitha operacionet për playlist-et:
 * - getAll: Merr të gjitha playlist-et (me opsion filtrimi për përdorues)
 * - getById: Merr një playlist specifik
 * - create: Krijon playlist të ri
 * - update: Përditëson playlist ekzistues
 * - delete: Fshin playlist
 * - addSong/removeSong: Menaxhon këngët në playlist
 */
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

/*
 * SONG API - MENAXHIMI I KËNGËVE
 * 
 * Përmban operacionet për këngët:
 * - getAll: Merr të gjitha këngët me paginacion
 * - search: Kërkon këngë sipas query-it
 * - getLiked: Merr këngët e pëlqyera të përdoruesit
 * - like/unlike: Menaxhon pëlqimet e këngëve
 * 
 * Karakteristika:
 * - Mbështetje për paginacion
 * - Kërkimi me encoding të sigurt të URL-ve
 * - Menaxhimi i pëlqimeve për përdorues
 */
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
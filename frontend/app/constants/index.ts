/*
 * APPLICATION CONSTANTS - KONSTANTET E APLIKACIONIT
 * 
 * Përmban të gjitha vlerat konstante që përdoren në aplikacion.
 * Centralizon konfigurimin për lehtësi menaxhimi dhe konsistencë.
 * 
 * Kategoritë:
 * - COLORS: Ngjyrat e tema-s (Spotify-inspired)
 * - STORAGE_KEYS: Çelësat e localStorage
 * - LIMITS: Kufizimet e aplikacionit
 * 
 * Përfitimet:
 * - Konsistencë në të gjithë aplikacionin
 * - Lehtësi përditësimi
 * - Shmangja e magic numbers/strings
 */
export const APP_CONSTANTS = {
  /*
   * COLORS - NGJYRAT E APLIKACIONIT
   * 
   * Paletë ngjyrash e inspiruar nga Spotify:
   * - PRIMARY: Jeshile kryesore e Spotify
   * - BACKGROUND: Ngjyra e zezë e sfondit
   * - CARD_BG: Gri e errët për karta
   * - TEXT: Ngjyrat e tekstit (primary/secondary)
   */
  COLORS: {
    PRIMARY: '#1db954',
    PRIMARY_HOVER: '#1ed760',
    BACKGROUND: '#191414',
    CARD_BG: '#282828',
    INPUT_BG: '#3e3e3e',
    TEXT_PRIMARY: 'white',
    TEXT_SECONDARY: '#a7a7a7',
    ERROR: '#e53e3e',
    ERROR_HOVER: '#c53030'
  },
  /*
   * STORAGE KEYS - ÇELËSAT E RUAJTJES
   * 
   * Çelësat e përdorur në localStorage:
   * - LAST_SONG: Kënga e fundit e dëgjuar
   * - RECENT_SONGS: Lista e këngëve të fundit
   * - CURRENT_PLAYLIST: Playlist-i aktual
   */
  STORAGE_KEYS: {
    LAST_SONG: 'lastSongListened',
    RECENT_SONGS: 'recentSongs',
    CURRENT_PLAYLIST: 'currentPlaylist'
  },
  /*
   * LIMITS - KUFIZIMET E APLIKACIONIT
   * 
   * Vlerat maksimale për funksionalitete të ndryshme:
   * - RECENT_SONGS: Sa këngë të ruhen në histori
   * - SONGS_PER_PAGE: Sa këngë për faqe në paginacion
   * - SEARCH_LIMIT: Sa rezultate në kërkim
   */
  LIMITS: {
    RECENT_SONGS: 10,
    SONGS_PER_PAGE: 50,
    SEARCH_LIMIT: 10
  }
};
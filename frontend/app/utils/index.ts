/*
 * UTILITY FUNCTIONS - FUNKSIONET NDIHMËSE
 * 
 * Përmban funksione të përdorshme që përdoren në të gjithë aplikacionin.
 * Ofron funksionalitete për formatim, storage dhe manipulim teksti.
 * 
 * Funksionet:
 * - formatDuration: Formaton kohëzgjatjen në format mm:ss ose hh:mm:ss
 * - formatPlaylistDuration: Formaton kohëzgjatjen totale të playlist-it
 * - truncateText: Shkurton tekstin me elipsis
 * - getStorageItem/setStorageItem: Utilita për localStorage
 */

/*
 * FORMAT DURATION - FORMATIMI I KOHËZGJATJES
 * 
 * Konverton sekonda në format të lexueshëm:
 * - Nën 1 orë: mm:ss
 * - Mbi 1 orë: hh:mm:ss
 * 
 * Përdoret për:
 * - Shfaqjen e kohëzgjatjes së këngëve
 * - Progress bar në player
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/*
 * FORMAT PLAYLIST DURATION - FORMATIMI I KOHËZGJATJES SË PLAYLIST-IT
 * 
 * Formaton kohëzgjatjen totale të playlist-it në format human-readable:
 * - "X hr Y min" për mbi 1 orë
 * - "X min" për nën 1 orë
 * 
 * Përdoret në:
 * - Header të playlist-it
 * - Statistika të playlist-it
 */
export const formatPlaylistDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
};

/*
 * TRUNCATE TEXT - SHKURTIMI I TEKSTIT
 * 
 * Shkurton tekstin nëse kalon gjatësinë maksimale dhe shton "...".
 * Përdoret për të shmangur overflow në UI.
 * 
 * Parametrat:
 * - text: Teksti për t'u shkurtuar
 * - maxLength: Gjatësia maksimale
 */
export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/*
 * GET STORAGE ITEM - MARRJA E ELEMENTEVE NGA STORAGE
 * 
 * Merr dhe parse-on të dhëna nga localStorage me error handling.
 * Kthen vlerën default nëse ka gabim ose nuk ekziston.
 * 
 * Generic function që mbështet çdo tip të dhënash.
 * Menaxhon automatikisht JSON parsing errors.
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/*
 * SET STORAGE ITEM - RUAJTJA E ELEMENTEVE NË STORAGE
 * 
 * Ruan të dhëna në localStorage me JSON serialization.
 * Menaxhon gabimet dhe i log-on për debugging.
 * 
 * Përdoret për:
 * - Ruajtjen e preferencave të përdoruesit
 * - Cache-imin e të dhënave lokale
 * - Persistenca e state-it
 */
export const setStorageItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};
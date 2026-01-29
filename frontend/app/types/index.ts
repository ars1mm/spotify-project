/*
 * TYPE DEFINITIONS - PËRKUFIZIMET E TIPEVE
 * 
 * Përmban të gjitha interface-t dhe tipet e të dhënave për aplikacionin.
 * Siguron type safety dhe IntelliSense support në të gjithë kodin.
 * 
 * Interface-t kryesore:
 * - Song: Struktura e këngëve
 * - Playlist: Struktura e playlist-eve
 * - User: Struktura e përdoruesve
 * - AuthSession: Struktura e sesionit të autentifikimit
 * 
 * Raste përdorimi:
 * - Type checking gjatë zhvillimit
 * - IntelliSense në IDE
 * - Validimi i të dhënave nga API
 */

/*
 * SONG INTERFACE - STRUKTURA E KËNGËVE
 * 
 * Përcakton të gjitha pronat e një kënge:
 * - id, title, artist: Të detyrueshme
 * - album, duration, cover_image_url, audio_url, file_path: Opsionale
 * 
 * Përdoret në:
 * - Player context
 * - Song lists dhe grids
 * - API responses
 */
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  cover_image_url?: string;
  audio_url?: string;
  file_path?: string;
}

/*
 * PLAYLIST INTERFACE - STRUKTURA E PLAYLIST-EVE
 * 
 * Përcakton të dhënat e një playlist-i:
 * - Metadata: name, description, visibility
 * - Ownership: user_id, created_at
 * - Relations: users (për join me user table)
 */
export interface Playlist {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  users?: { name: string };
}

/*
 * USER INTERFACE - STRUKTURA E PËRDORUESVE
 * 
 * Përcakton të dhënat bazike të përdoruesit:
 * - id: Identifikuesi unik
 * - email: Email adresa (e detyrueshme)
 * - name: Emri i shfaqur (opsional)
 */
export interface User {
  id: string;
  email: string;
  name?: string;
}

/*
 * AUTH SESSION INTERFACE - STRUKTURA E SESIONIT
 * 
 * Përmban të dhënat e sesionit të autentifikimit:
 * - user: Të dhënat e përdoruesit
 * - access_token: Token për autorizim
 * - refresh_token: Token për rinovim (opsional)
 */
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
}
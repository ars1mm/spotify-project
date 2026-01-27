/**
 * ************************************
 * EN: TYPES - Admin Module
 *    Shared TypeScript interfaces for the admin section
 * AL: TIPET - Moduli Admin
 *    Ndërfaqet e përbashkëta TypeScript për seksionin admin
 * ************************************
 */

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  genre: string[]
  coverImage: string
  coverFile: File | null
  audioFile: File | null
}

export interface ExistingSong {
  id: string
  title: string
  artist: string
  album: string
  duration_seconds: number
  file_path: string
  cover_image_url: string
  created_at: string
}

export interface KeyExpiryInfo {
  expired: boolean
  expires_at: string
  seconds_remaining: number
  rotation_interval_seconds: number
}

export interface LogMessage {
  timestamp: string
  text: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const GENRES = [
  'Pop',
  'Hip Hop',
  'R&B',
  'Rock',
  'Electronic',
  'Jazz',
  'Country',
  'Classical',
  'Indie',
  'Soul',
  'Reggae',
  'Blues',
  'Folk',
  'Metal',
  'Punk',
  'Dance',
  'Latin',
  'K-Pop',
  'Alternative',
  'Trap',
]

/**
 * EN: How to add a new type:
 * 1. Define the interface with clear property names
 * 2. Add JSDoc comments for each property
 * 3. Export it from this file
 * 4. Import it where needed
 * 
 * AL: Si të shtoni një tip të ri:
 * 1. Përcaktoni ndërfaqen me emra të qartë të pronave
 * 2. Shtoni komente JSDoc për çdo pronë
 * 3. Eksportojeni nga ky file
 * 4. Importojeni ku nevojitet
 */

export interface KeyExpiryInfo {
  expires_at: string;
  days_remaining: number;
  expired: boolean;
  seconds_remaining: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string[];
  coverImage: string;
  coverFile: File | null;
  audioFile: File | null;
}

export interface ExistingSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration_seconds: number;
  created_at: string;
}

export const GENRES = [
  'Pop',
  'Rock',
  'Hip Hop',
  'R&B',
  'Country',
  'Electronic',
  'Jazz',
  'Classical',
  'Metal',
  'Folk',
  'Reggae',
  'Blues',
  'Soul',
  'Funk',
  'Punk',
  'Indie',
  'Alternative',
  'Dance',
  'World',
  'Latin'
];
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

export interface Playlist {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  users?: { name: string };
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
}
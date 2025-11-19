-- Schema improvements for better performance and data integrity

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_trending_songs_rank ON trending_songs(rank_position);
CREATE INDEX IF NOT EXISTS idx_trending_albums_rank ON trending_albums(rank_position);

-- Add unique constraint to prevent duplicate songs in same playlist
ALTER TABLE playlist_songs ADD CONSTRAINT unique_playlist_song 
UNIQUE (playlist_id, song_id);

-- Add check constraints for data validation
ALTER TABLE songs ADD CONSTRAINT check_duration_positive 
CHECK (duration_seconds > 0);

ALTER TABLE trending_songs ADD CONSTRAINT check_rank_positive 
CHECK (rank_position > 0);

ALTER TABLE trending_albums ADD CONSTRAINT check_rank_positive 
CHECK (rank_position > 0);

-- Add missing tables for better functionality
CREATE TABLE IF NOT EXISTS user_song_plays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    played_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    play_duration_seconds integer DEFAULT 0
);

CREATE INDEX idx_user_song_plays_user_id ON user_song_plays(user_id);
CREATE INDEX idx_user_song_plays_song_id ON user_song_plays(song_id);
CREATE INDEX idx_user_song_plays_played_at ON user_song_plays(played_at);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role varchar(50) NOT NULL DEFAULT 'admin',
    permissions jsonb DEFAULT '[]',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
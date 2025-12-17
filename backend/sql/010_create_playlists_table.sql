-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(playlist_id, song_id)
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Users can view public playlists"
ON playlists FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
ON playlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
ON playlists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
ON playlists FOR DELETE
USING (auth.uid() = user_id);

-- Playlist songs policies
CREATE POLICY "Users can view songs in accessible playlists"
ON playlist_songs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_songs.playlist_id
        AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
);

CREATE POLICY "Users can add songs to their playlists"
ON playlist_songs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_songs.playlist_id
        AND playlists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can remove songs from their playlists"
ON playlist_songs FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_songs.playlist_id
        AND playlists.user_id = auth.uid()
    )
);

-- Create indexes
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);

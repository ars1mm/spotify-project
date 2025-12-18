-- Create liked_songs table
CREATE TABLE IF NOT EXISTS liked_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);

CREATE INDEX idx_liked_songs_user_id ON liked_songs(user_id);
CREATE INDEX idx_liked_songs_song_id ON liked_songs(song_id);

-- Enable RLS
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own liked songs
CREATE POLICY "Users can view own liked songs" ON liked_songs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own liked songs
CREATE POLICY "Users can insert own liked songs" ON liked_songs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own liked songs
CREATE POLICY "Users can delete own liked songs" ON liked_songs
    FOR DELETE USING (auth.uid() = user_id);

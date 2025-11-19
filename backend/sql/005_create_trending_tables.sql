-- Create trending_songs table
CREATE TABLE IF NOT EXISTS trending_songs (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    rank_position INTEGER NOT NULL,
    trend_score DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trending_albums table  
CREATE TABLE IF NOT EXISTS trending_albums (
    id SERIAL PRIMARY KEY,
    album_name VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_cover_url TEXT,
    rank_position INTEGER NOT NULL,
    trend_score DECIMAL(10,2) DEFAULT 0.0,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trending_songs_rank ON trending_songs(rank_position);
CREATE INDEX IF NOT EXISTS idx_trending_albums_rank ON trending_albums(rank_position);
CREATE INDEX IF NOT EXISTS idx_trending_songs_score ON trending_songs(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_albums_score ON trending_albums(trend_score DESC);
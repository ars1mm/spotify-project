-- Migration script to handle existing songs table
-- This handles the case where songs table already exists with artist/album as strings

-- Step 1: Add new columns if they don't exist
ALTER TABLE songs ADD COLUMN IF NOT EXISTS artist_id UUID;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS album_id UUID;

-- Step 2: Migrate existing artist data
INSERT INTO artists (name)
SELECT DISTINCT artist 
FROM songs 
WHERE artist IS NOT NULL 
AND artist NOT IN (SELECT name FROM artists)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Migrate existing album data
INSERT INTO albums (title, artist_id)
SELECT DISTINCT s.album, a.id
FROM songs s
JOIN artists a ON a.name = s.artist
WHERE s.album IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM albums al 
    WHERE al.title = s.album AND al.artist_id = a.id
);

-- Step 4: Update songs with foreign keys
UPDATE songs 
SET artist_id = a.id
FROM artists a
WHERE songs.artist = a.name AND songs.artist_id IS NULL;

UPDATE songs 
SET album_id = al.id
FROM albums al
JOIN artists a ON al.artist_id = a.id
WHERE songs.album = al.title 
AND songs.artist = a.name 
AND songs.album_id IS NULL;

-- Step 5: Drop old columns (uncomment when ready)
-- ALTER TABLE songs DROP COLUMN IF EXISTS artist;
-- ALTER TABLE songs DROP COLUMN IF EXISTS album;
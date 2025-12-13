-- Enable Row Level Security on songs table if not already enabled
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to songs" ON songs;
DROP POLICY IF EXISTS "Allow authenticated users to insert songs" ON songs;
DROP POLICY IF EXISTS "Allow service role to insert songs" ON songs;
DROP POLICY IF EXISTS "Allow anon to insert songs" ON songs;

-- Policy 1: Allow anyone to read songs (public access)
CREATE POLICY "Allow public read access to songs"
ON songs
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users to insert songs
-- This allows both authenticated users and service role to insert
CREATE POLICY "Allow authenticated users to insert songs"
ON songs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow anonymous (anon) role to insert songs
-- This is needed if your backend uses the anon key to insert songs
CREATE POLICY "Allow anon to insert songs"
ON songs
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 4: Allow service role full access (backup policy)
CREATE POLICY "Allow service role full access to songs"
ON songs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Optional: If you want to allow updates and deletes for authenticated users
CREATE POLICY "Allow authenticated users to update songs"
ON songs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete songs"
ON songs
FOR DELETE
TO authenticated
USING (true);

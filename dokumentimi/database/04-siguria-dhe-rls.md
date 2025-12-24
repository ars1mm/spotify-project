# Siguria dhe Rregullat RLS

Siguria e të dhënave menaxhohet në dy nivele: në nivel aplikacioni (FastAPI) dhe në nivel baze të dhënash (Supabase RLS).

## Row Level Security (RLS)

RLS na lejon të përcaktojmë saktësisht se kush mund të lexojë, shtojë, modifikojë ose fshijë rreshta specifikë në një tabelë.

### 1. Liked Songs (Këngët e Pëlqyera)

Çdo përdorues duhet të ketë akses vetëm në pëlqimet e veta.

```sql
-- Përdoruesit mund të shohin vetëm pëlqimet e veta
CREATE POLICY "Users can view own liked songs" ON liked_songs
    FOR SELECT USING (auth.uid() = user_id);

-- Përdoruesit mund të shtojnë vetëm pëlqimet e veta
CREATE POLICY "Users can insert own liked songs" ON liked_songs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Përdoruesit mund të fshijnë vetëm pëlqimet e veta
CREATE POLICY "Users can delete own liked songs" ON liked_songs
    FOR DELETE USING (auth.uid() = user_id);
```

### 2. Playlists (Listat e Luanjes)

Aksesi në lista varet nga fusha `is_public`.

*   **SELECT**: Përdoruesi mund të shohë një playlist nëse ai është publik OSE nëse është pronari i tij.
*   **INSERT/UPDATE/DELETE**: Vetëm pronari (ku `auth.uid() = user_id`) mund të bëjë ndryshime.

### 3. Playlist Songs

Aksesi në këngët e një liste luanje kontrollohet duke kontrolluar aksesin në listën prindërore.

```sql
CREATE POLICY "Users can view songs in accessible playlists"
ON playlist_songs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_songs.playlist_id
        AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
);
```

## Bypassing RLS (Service Role)

Në raste të veçanta, Serveri (Backend) përdor `service_role_key` për të anashkaluar RLS. Kjo bëhet për:
*   Veprime administrative.
*   Përditësimin e statistikave globale.
*   Kur kërkohet performancë e lartë dypalëshe pa pasur nevojë për JWT të përdoruesit në çdo hap të logjikës së brendshme.

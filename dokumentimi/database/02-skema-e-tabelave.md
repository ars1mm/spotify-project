# Skema e Tabelave

Në këtë seksion detajohen tabelat kryesore të sistemit dhe fushat e tyre respektive.

## 1. users (përmes auth.users)

Aplikacioni mbështetet në skemën e autentifikimit të Supabase.

| Kolona | Tipi | Përshkrimi |
| :--- | :--- | :--- |
| `id` | UUID | Çelësi primar (nga Supabase Auth) |
| `email` | String | Email-i unik i përdoruesit |
| `name` | String | Emri (ruhet në `user_metadata`) |

## 2. songs

Ruan informacionin për çdo këngë në sistem.

```sql
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration_seconds INTEGER,
    file_path VARCHAR(500) NOT NULL,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 3. playlists

Ruan listat e luanjes të krijuara nga përdoruesit.

```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. playlist_songs

Tabela lidhëse (junction table) për shumë-me-shumë (N:M).

```sql
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(playlist_id, song_id)
);
```

## 5. liked_songs

Ruajtja e këngëve të pëlqyera nga çdo përdorues.

```sql
CREATE TABLE liked_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);
```

## 6. trending_songs & trending_albums

Tabela për menaxhimin e përmbajtjes që shfaqet në faqen kryesore.

| Kolona | Tipi | Përshkrimi |
| :--- | :--- | :--- |
| `id` | UUID | Identifikuesi unik |
| `song_id/album_id` | UUID | Referenca te kënga ose albumi |
| `rank_position` | Integer | Pozicioni në listën trending |

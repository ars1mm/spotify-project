# Supabase ORM Documentation - Spotify Project

## Përmbledhje

Ky dokument përshkruan arkitekturën dhe përdorimin e Supabase si ORM (Object-Relational Mapping) për projektin Spotify. Supabase ofron një API të plotë për menaxhimin e të dhënave, autentifikimin dhe ruajtjen e skedarëve.

## Struktura e Bazës së të Dhënave

### Tabelat Kryesore

#### 1. Users (Përdoruesit)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Artists (Artistët)

```sql
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Albums (Albumet)

```sql
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    cover_image_url VARCHAR(500),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, artist_id)
);
```

#### 4. Songs (Këngët)

```sql
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    duration_seconds INTEGER,
    file_path VARCHAR(500) NOT NULL,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Playlists (Playlist-et)

```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Playlist Songs (Këngët e Playlist-it)

```sql
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);
```

#### 7. Liked Songs (Këngët e Pëlqyera)

```sql
CREATE TABLE liked_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);
```

## Konfigurimi i Supabase Client

### Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=songs
```

### Client Initialization

```python
from supabase import create_client, Client
import os

def get_supabase_client() -> Client:
    """Get Supabase client with anon key (public operations)"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    return create_client(url, key)

def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with service role key (admin operations)"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)
```

## CRUD Operations

### 1. Songs (Këngët)

#### Create Song

```python
def create_song(self, song_data: dict) -> dict:
    """Create a new song"""
    try:
        response = self.supabase.table("songs").insert({
            "title": song_data["title"],
            "artist": song_data["artist"],
            "album": song_data.get("album"),
            "duration_seconds": song_data.get("duration_seconds"),
            "file_path": song_data["file_path"],
            "cover_image_url": song_data.get("cover_image_url")
        }).execute()
        
        return {"success": True, "song": response.data[0]}
    except Exception as e:
        return {"error": str(e)}
```

#### Read Songs (with Pagination)

```python
def list_songs(self, page: int = 1, limit: int = 50) -> dict:
    """Fetch songs with pagination"""
    try:
        offset = (page - 1) * limit
        
        # Get total count
        count_response = self.supabase.table("songs").select("*", count="exact").execute()
        total_count = count_response.count or 0
        
        # Get paginated songs
        response = self.supabase.table("songs").select("*").range(offset, offset + limit - 1).execute()
        
        songs = []
        for song in response.data:
            audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
            songs.append({
                "id": song['id'],
                "title": song['title'],
                "artist": song['artist'],
                "album": song.get('album'),
                "duration_seconds": song.get('duration_seconds'),
                "cover_image_url": song.get('cover_image_url'),
                "audio_url": audio_url,
                "created_at": song['created_at']
            })
        
        return {
            "songs": songs,
            "page": page,
            "limit": limit,
            "total": total_count
        }
    except Exception as e:
        return {"error": str(e)}
```

#### Update Song

```python
def update_song(self, song_id: str, update_data: dict) -> dict:
    """Update song information"""
    try:
        response = self.supabase.table("songs").update(update_data).eq("id", song_id).execute()
        return {"success": True, "song": response.data[0]}
    except Exception as e:
        return {"error": str(e)}
```

#### Delete Song

```python
def delete_song(self, song_id: str) -> dict:
    """Delete song and its file from storage"""
    try:
        # Get song file path
        song_response = self.supabase.table("songs").select("file_path").eq("id", song_id).execute()
        
        if not song_response.data:
            raise Exception("Song not found")
        
        file_path = song_response.data[0].get("file_path")
        
        # Delete from database
        self.supabase.table("songs").delete().eq("id", song_id).execute()
        
        # Delete file from storage
        if file_path:
            self.supabase.storage.from_(self.bucket_name).remove([file_path])
        
        return {"success": True, "message": "Song deleted successfully"}
    except Exception as e:
        return {"error": str(e)}
```

### 2. Playlists

#### Create Playlist

```python
def create_playlist(self, name: str, description: str, is_public: bool, user_id: str, song_ids: list = []) -> dict:
    """Create a new playlist"""
    try:
        response = self.supabase.table("playlists").insert({
            "name": name,
            "description": description,
            "is_public": is_public,
            "user_id": user_id
        }).execute()
        
        if response.data:
            playlist_id = response.data[0]['id']
            
            # Add songs to playlist
            for idx, song_id in enumerate(song_ids):
                self.supabase.table("playlist_songs").insert({
                    "playlist_id": playlist_id,
                    "song_id": song_id,
                    "position": idx
                }).execute()
            
            return {"success": True, "playlist": response.data[0]}
        return {"error": "Failed to create playlist"}
    except Exception as e:
        return {"error": str(e)}
```

#### Get Playlist with Songs

```python
def get_playlist_by_id(self, playlist_id: str) -> dict:
    """Get playlist with its songs"""
    try:
        # Get playlist info
        playlist_response = self.supabase.table("playlists").select("*").eq("id", playlist_id).execute()
        
        if not playlist_response.data:
            return {"error": "Playlist not found"}
        
        playlist = playlist_response.data[0]
        
        # Get songs in playlist with JOIN
        songs_response = self.supabase.table("playlist_songs").select(
            "*, songs(*)"
        ).eq("playlist_id", playlist_id).order("position").execute()
        
        songs = []
        for item in songs_response.data:
            song = item.get('songs')
            if song:
                audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
                songs.append({
                    "id": song['id'],
                    "title": song['title'],
                    "artist": song['artist'],
                    "album": song.get('album'),
                    "duration_seconds": song.get('duration_seconds'),
                    "cover_image_url": song.get('cover_image_url'),
                    "audio_url": audio_url
                })
        
        return {"playlist": playlist, "songs": songs}
    except Exception as e:
        return {"error": str(e)}
```

#### Add Song to Playlist

```python
def add_song_to_playlist(self, playlist_id: str, song_id: str) -> dict:
    """Add a song to playlist"""
    try:
        # Get max position
        response = self.supabase.table("playlist_songs").select("position").eq("playlist_id", playlist_id).order("position", desc=True).limit(1).execute()
        position = (response.data[0]['position'] + 1) if response.data else 0
        
        self.supabase.table("playlist_songs").insert({
            "playlist_id": playlist_id,
            "song_id": song_id,
            "position": position
        }).execute()
        
        return {"success": True, "message": "Song added to playlist"}
    except Exception as e:
        return {"error": str(e)}
```

### 3. User Authentication

#### Sign Up

```python
def create_user(self, email: str, password: str, name: str) -> dict:
    """Create a new user with Supabase Auth"""
    try:
        response = self.supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"name": name}
            }
        })
        
        if response.user:
            return {"success": True, "user": response.user}
        else:
            return {"error": "Failed to create user"}
    except Exception as e:
        return {"error": str(e)}
```

#### Sign In

```python
def login_user(self, email: str, password: str) -> dict:
    """Login user with Supabase Auth"""
    try:
        response = self.supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user:
            return {"success": True, "user": response.user, "session": response.session}
        else:
            return {"error": "Invalid credentials"}
    except Exception as e:
        return {"error": str(e)}
```

### 4. Search Operations

#### Search Songs and Playlists

```python
def search_songs(self, query: str, limit: int = 10) -> dict:
    """Search songs and playlists"""
    try:
        # Search songs
        songs_response = self.supabase.table("songs").select(
            "id, title, artist, album, duration_seconds, cover_image_url, file_path, created_at"
        ).or_(
            f"title.ilike.%{query}%,artist.ilike.%{query}%,album.ilike.%{query}%"
        ).limit(limit).execute()
        
        songs = []
        for song in songs_response.data:
            audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
            songs.append({
                "id": song['id'],
                "title": song['title'],
                "artist": song['artist'],
                "album": song.get('album'),
                "duration_seconds": song.get('duration_seconds'),
                "cover_image_url": song.get('cover_image_url'),
                "audio_url": audio_url,
                "created_at": song['created_at']
            })
        
        # Search playlists
        playlists_response = self.supabase.table("playlists").select(
            "id, name, description, is_public, user_id, created_at"
        ).or_(
            f"name.ilike.%{query}%,description.ilike.%{query}%"
        ).eq("is_public", True).limit(limit).execute()
        
        return {
            "songs": songs,
            "playlists": playlists_response.data or [],
            "total": len(songs) + len(playlists_response.data or [])
        }
    except Exception as e:
        return {"error": str(e)}
```

## File Storage Operations

### Upload Audio File

```python
def upload_file(self, file_content: bytes, file_path: str, content_type: str) -> str:
    """Upload file to Supabase Storage"""
    try:
        self.supabase.storage.from_(self.bucket_name).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        return file_path
    except Exception as e:
        raise e
```

### Upload Cover Image

```python
def upload_cover(self, file_content: bytes, file_path: str, content_type: str) -> str:
    """Upload cover image to covers bucket"""
    try:
        covers_bucket = "covers"
        self.supabase.storage.from_(covers_bucket).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        
        # Return public URL
        public_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{covers_bucket}/{file_path}"
        return public_url
    except Exception as e:
        raise e
```

## Advanced Queries

### Get Trending Songs

```python
def get_trending_songs(self, limit: int = 10) -> dict:
    """Get trending songs with JOIN"""
    try:
        response = self.supabase.table("trending_songs").select(
            "*, songs(title, artist, album, cover_image_url)"
        ).order("rank_position").limit(limit).execute()
        
        return {"trending_songs": response.data}
    except Exception as e:
        return {"error": str(e)}
```

### Get User's Liked Songs

```python
def get_liked_songs(self, user_id: str) -> dict:
    """Get user's liked songs with JOIN"""
    try:
        response = self.supabase.table("liked_songs").select(
            "*, songs(*)"
        ).eq("user_id", user_id).order("created_at", desc=True).execute()
        
        songs = []
        for item in response.data:
            song = item.get('songs')
            if song:
                audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
                songs.append({
                    "id": song['id'],
                    "title": song['title'],
                    "artist": song['artist'],
                    "album": song.get('album'),
                    "duration_seconds": song.get('duration_seconds'),
                    "cover_image_url": song.get('cover_image_url'),
                    "audio_url": audio_url
                })
        
        return {"songs": songs}
    except Exception as e:
        return {"error": str(e)}
```

## Error Handling

### Best Practices

```python
def safe_database_operation(self, operation_func, *args, **kwargs):
    """Wrapper for safe database operations"""
    try:
        return operation_func(*args, **kwargs)
    except Exception as e:
        # Log error
        print(f"Database error: {str(e)}")
        
        # Return standardized error response
        return {
            "error": str(e),
            "success": False,
            "data": None
        }
```

## Performance Optimization

### Indexing Strategy

```sql
-- Essential indexes for performance
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_liked_songs_user_id ON liked_songs(user_id);
```

### Query Optimization

```python
# Use select() to limit returned columns
response = self.supabase.table("songs").select("id, title, artist").execute()

# Use pagination for large datasets
response = self.supabase.table("songs").select("*").range(0, 49).execute()

# Use filters to reduce data transfer
response = self.supabase.table("songs").select("*").eq("artist", "Artist Name").execute()
```

## Security Considerations

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own playlists" ON playlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### API Key Management

```python
# Use service role key only for admin operations
admin_client = get_supabase_admin_client()  # Service role key

# Use anon key for public operations
public_client = get_supabase_client()  # Anon key
```

## Testing

### Unit Tests Example

```python
import pytest
from app.utils.supabase_client import SupabaseStorageClient

def test_create_song():
    client = SupabaseStorageClient()
    song_data = {
        "title": "Test Song",
        "artist": "Test Artist",
        "file_path": "test/song.mp3"
    }
    
    result = client.insert_song(song_data)
    assert "error" not in result
    assert result["title"] == "Test Song"
```

## Monitoring dhe Logging

### Database Monitoring

```python
import logging

logger = logging.getLogger(__name__)

def log_database_operation(operation: str, table: str, success: bool, duration: float):
    """Log database operations for monitoring"""
    logger.info(f"DB Operation: {operation} on {table} - Success: {success} - Duration: {duration}ms")
```

## Conclusion

Ky dokument ofron një udhëzues të plotë për përdorimin e Supabase si ORM në projektin Spotify. Supabase ofron një zgjidhje të fuqishme që kombinon bazën e të dhënave PostgreSQL, autentifikimin, dhe ruajtjen e skedarëve në një platformë të vetme.

### Përfitimet e Supabase

- **Real-time subscriptions** për ndryshime në kohë reale
- **Built-in authentication** me shumë opsione
- **File storage** i integruar
- **Auto-generated APIs** bazuar në skemën e bazës së të dhënave
- **Row Level Security** për siguri të avancuar
- **PostgreSQL** si bazë e të dhënave me performancë të lartë

### Resurse të Dobishme

- [Supabase Documentation](<https://supabase.com/docs>)
- [PostgreSQL Documentation](<https://www.postgresql.org/docs/>)
- [Python Supabase Client](<https://github.com/supabase-community/supabase-py>)
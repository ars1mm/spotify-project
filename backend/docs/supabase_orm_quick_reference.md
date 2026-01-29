# Supabase ORM Quick Reference Guide

## Përmbledhje e Shpejtë

Ky dokument ofron një referencë të shpejtë për operacionet më të përdorura të Supabase ORM në projektin Spotify.

## Konfigurimi i Shpejtë

### 1. Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=songs
```

### 2. Import të Nevojshme

```python
from app.utils.supabase_client import SupabaseStorageClient, get_supabase_client
from app.models.supabase_models import SongModel, PlaylistModel, CreateSongRequest
```

## Operacionet Bazë

### Songs (Këngët)

#### Krijimi i një Kënge

```python
# Metoda 1: Me SupabaseStorageClient
client = SupabaseStorageClient()
song_data = {
    "title": "Song Title",
    "artist": "Artist Name", 
    "album": "Album Name",
    "duration_seconds": 180,
    "file_path": "songs/2024/01/song.mp3",
    "cover_image_url": "https://example.com/cover.jpg"
}
result = client.insert_song(song_data)

# Metoda 2: Me Pydantic Model
from app.models.supabase_models import CreateSongRequest
request = CreateSongRequest(
    title="Song Title",
    artist="Artist Name",
    album="Album Name", 
    duration_seconds=180
)
```

#### Leximi i Këngëve

```python
# Lista e këngëve me pagination
songs = client.list_songs(page=1, limit=20)

# Kërkimi i këngëve
results = client.search_songs("rock music", limit=10)

# Këngët trending
trending = client.get_trending_songs(limit=10)
```

#### Përditësimi i një Kënge

```python
supabase = get_supabase_client()
update_data = {"title": "New Title", "artist": "New Artist"}
result = supabase.table("songs").update(update_data).eq("id", song_id).execute()
```

#### Fshirja e një Kënge

```python
result = client.delete_song(song_id)
```

### Playlists

#### Krijimi i një Playlist

```python
result = client.create_playlist(
    name="My Playlist",
    description="My favorite songs",
    is_public=True,
    user_id="user-uuid",
    song_ids=["song1-uuid", "song2-uuid"]
)
```

#### Leximi i Playlist-eve

```python
# Playlist-et e një përdoruesi
playlists = client.get_playlists(user_id="user-uuid")

# Playlist-et publike
public_playlists = client.get_playlists(public_only=True)

# Një playlist specifike me këngët e saj
playlist = client.get_playlist_by_id("playlist-uuid")
```

#### Menaxhimi i Këngëve në Playlist

```python
# Shtimi i një kënge
client.add_song_to_playlist("playlist-uuid", "song-uuid")

# Heqja e një kënge
client.remove_song_from_playlist("playlist-uuid", "song-uuid")
```

### User Authentication

#### Regjistrimi

```python
result = client.create_user(
    email="user@example.com",
    password="securepassword",
    name="User Name"
)
```

#### Login

```python
result = client.login_user(
    email="user@example.com", 
    password="password"
)
```

#### Reset Password

```python
result = client.reset_password("user@example.com")
```

### File Storage

#### Upload Audio File

```python
with open("song.mp3", "rb") as f:
    file_content = f.read()

file_path = client.upload_file(
    file_content=file_content,
    file_path="songs/2024/01/song.mp3",
    content_type="audio/mpeg"
)
```

#### Upload Cover Image

```python
with open("cover.jpg", "rb") as f:
    cover_content = f.read()

cover_url = client.upload_cover(
    file_content=cover_content,
    file_path="covers/2024/01/cover.jpg", 
    content_type="image/jpeg"
)
```

## Query të Avancuara

### JOIN Queries

```python
# Playlist me këngët e saj
supabase = get_supabase_client()
result = supabase.table("playlist_songs").select(
    "*, songs(*), playlists(*)"
).eq("playlist_id", playlist_id).execute()

# Këngët e pëlqyera të një përdoruesi
result = supabase.table("liked_songs").select(
    "*, songs(*)"
).eq("user_id", user_id).execute()
```

### Filtering dhe Sorting

```python
# Filter by artist
songs = supabase.table("songs").select("*").eq("artist", "Artist Name").execute()

# Sort by creation date
songs = supabase.table("songs").select("*").order("created_at", desc=True).execute()

# Limit results
songs = supabase.table("songs").select("*").limit(10).execute()

# Pagination
songs = supabase.table("songs").select("*").range(0, 19).execute()  # First 20 items
```

### Search Operations

```python
# Case-insensitive search
songs = supabase.table("songs").select("*").ilike("title", "%rock%").execute()

# Multiple field search
songs = supabase.table("songs").select("*").or_(
    "title.ilike.%query%,artist.ilike.%query%,album.ilike.%query%"
).execute()
```

## Liked Songs Operations

```python
# Like a song
client.like_song("user-uuid", "song-uuid")

# Unlike a song  
client.unlike_song("user-uuid", "song-uuid")

# Get user's liked songs
liked_songs = client.get_liked_songs("user-uuid")

# Check if song is liked
is_liked = client.is_song_liked("user-uuid", "song-uuid")
```

## Error Handling

### Basic Error Handling

```python
try:
    result = client.create_playlist(name="Test", user_id="user-uuid")
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print("Success!")
except Exception as e:
    print(f"Exception: {str(e)}")
```

### Model Validation

```python
from app.models.supabase_models import ModelValidator

# Validate song data
errors = ModelValidator.validate_song_data({
    "title": "Song Title",
    "artist": "Artist Name",
    "file_path": "path/to/file.mp3"
})

if errors:
    print(f"Validation errors: {errors}")
```

## Performance Tips

### 1. Use Indexes

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
```

### 2. Limit Data Transfer

```python
# Select only needed columns
result = supabase.table("songs").select("id, title, artist").execute()

# Use pagination for large datasets
result = supabase.table("songs").select("*").range(0, 49).execute()
```

### 3. Batch Operations

```python
# Insert multiple records at once
songs_data = [
    {"title": "Song 1", "artist": "Artist 1"},
    {"title": "Song 2", "artist": "Artist 2"}
]
result = supabase.table("songs").insert(songs_data).execute()
```

## Security Best Practices

### 1. Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can access their own playlists" ON playlists
    FOR ALL USING (auth.uid() = user_id);
```

### 2. Use Appropriate Keys

```python
# Use anon key for public operations
public_client = get_supabase_client()

# Use service role key for admin operations
admin_client = get_supabase_admin_client()
```

### 3. Validate Input

```python
from app.models.supabase_models import sanitize_search_query

# Sanitize user input
clean_query = sanitize_search_query(user_input)
```

## Common Patterns

### 1. Pagination Pattern

```python
def get_paginated_songs(page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    
    # Get total count
    count_result = supabase.table("songs").select("*", count="exact").execute()
    total = count_result.count
    
    # Get paginated data
    songs = supabase.table("songs").select("*").range(offset, offset + limit - 1).execute()
    
    return {
        "data": songs.data,
        "page": page,
        "limit": limit,
        "total": total,
        "has_next": (page * limit) < total
    }
```

### 2. Search Pattern

```python
def search_content(query: str, content_type: str = "all"):
    results = {}
    
    if content_type in ["all", "songs"]:
        songs = supabase.table("songs").select("*").or_(
            f"title.ilike.%{query}%,artist.ilike.%{query}%"
        ).execute()
        results["songs"] = songs.data
    
    if content_type in ["all", "playlists"]:
        playlists = supabase.table("playlists").select("*").ilike(
            "name", f"%{query}%"
        ).eq("is_public", True).execute()
        results["playlists"] = playlists.data
    
    return results
```

### 3. User Library Pattern

```python
def get_user_library(user_id: str):
    # Get user's playlists
    playlists = supabase.table("playlists").select("*").eq("user_id", user_id).execute()
    
    # Get user's liked songs
    liked_songs = supabase.table("liked_songs").select(
        "*, songs(*)"
    ).eq("user_id", user_id).execute()
    
    return {
        "playlists": playlists.data,
        "liked_songs": [item["songs"] for item in liked_songs.data]
    }
```

## Debugging Tips

### 1. Enable Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Supabase operations will now log details
```

### 2. Check Response Structure

```python
result = supabase.table("songs").select("*").execute()
print(f"Data: {result.data}")
print(f"Count: {result.count}")
print(f"Status: {result.status_code}")
```

### 3. Validate UUIDs

```python
from app.models.supabase_models import validate_uuid

if not validate_uuid(song_id):
    print("Invalid UUID format")
```

## Shembuj të Plotë

### Complete Song Upload Flow

```python
async def upload_song_complete(title: str, artist: str, audio_file: bytes, cover_file: bytes = None):
    client = SupabaseStorageClient(use_service_role=True)
    
    try:
        # 1. Upload audio file
        audio_path = f"songs/{datetime.now().strftime('%Y/%m')}/{title.replace(' ', '_')}.mp3"
        uploaded_audio = client.upload_file(audio_file, audio_path, "audio/mpeg")
        
        # 2. Upload cover if provided
        cover_url = None
        if cover_file:
            cover_path = f"covers/{datetime.now().strftime('%Y/%m')}/{title.replace(' ', '_')}.jpg"
            cover_url = client.upload_cover(cover_file, cover_path, "image/jpeg")
        
        # 3. Insert song metadata
        song_data = {
            "title": title,
            "artist": artist,
            "file_path": uploaded_audio,
            "cover_image_url": cover_url
        }
        
        result = client.insert_song(song_data)
        return {"success": True, "song": result}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
```

Ky dokument ofron një referencë të shpejtë për operacionet më të rëndësishme të Supabase ORM. Për detaje të plota, referojuni dokumentacionit kryesor të Supabase ORM.
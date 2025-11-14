# Backend Documentation

## Overview

Python backend using FastAPI for the Spotify-like application. Handles authentication, user management, playlist operations, and music streaming.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Auth0 JWT tokens
- **Cache**: Redis
- **Storage**: Supabase S3 for audio files
- **External API**: Spotify Web API

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost/spotify_db
REDIS_URL=redis://localhost:6379
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_API_AUDIENCE=your-api-identifier
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Running the Server

```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- `POST /auth/verify` - Verify JWT token

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

### Playlists
- `GET /playlists` - List user playlists
- `POST /playlists` - Create playlist
- `GET /playlists/{id}` - Get playlist details
- `PUT /playlists/{id}` - Update playlist
- `DELETE /playlists/{id}` - Delete playlist

### Songs
- `GET /songs/trending` - Get trending songs from Spotify
- `GET /songs/{id}` - Get song details
- `GET /songs/{id}/stream` - Stream audio file
- `POST /songs/{id}/favorite` - Add to favorites

### Admin
- `POST /admin/songs` - Upload song file
- `DELETE /admin/songs/{id}` - Remove song

## Database Models

### User
```python
class User(Base):
    id: str (Primary Key)
    email: str
    name: str
    preferences: JSON
    created_at: datetime
```

### Playlist
```python
class Playlist(Base):
    id: UUID (Primary Key)
    name: str
    user_id: str (Foreign Key)
    songs: List[Song]
    created_at: datetime
```

### Song
```python
class Song(Base):
    id: UUID (Primary Key)
    title: str
    artist: str
    file_url: str
    spotify_id: str (Optional)
    duration: int
```

## Architecture

```mermaid
graph TB
    FE[Frontend] --> API[FastAPI Backend]
    API --> AUTH[Auth0]
    API --> DB[(PostgreSQL)]
    API --> REDIS[(Redis Cache)]
    API --> S3[Supabase S3]
    API --> SPOTIFY[Spotify API]
    
    classDef external fill:#e1f5fe
    classDef storage fill:#f3e5f5
    classDef api fill:#e8f5e8
    
    class AUTH,SPOTIFY external
    class DB,REDIS,S3 storage
    class API api
```

## Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string email
        string name
        json preferences
        datetime created_at
    }
    
    Playlist {
        uuid id PK
        string name
        string description
        string user_id FK
        datetime created_at
    }
    
    Song {
        uuid id PK
        string title
        string artist
        string file_url
        string spotify_id
        int duration
    }
    
    PlaylistSong {
        uuid playlist_id FK
        uuid song_id FK
        int position
        datetime added_at
    }
    
    User ||--o{ Playlist : creates
    Playlist ||--o{ PlaylistSong : contains
    Song ||--o{ PlaylistSong : included_in
```

## Services

### SpotifyService
- Fetches trending songs based on user preferences
- Handles Spotify API authentication
- Caches results in Redis

### AudioService
- Streams audio files from Supabase S3
- Handles file uploads for admin

### PlaylistService
- Manages playlist CRUD operations
- Handles song associations

## Security

- JWT token validation on protected routes
- Rate limiting (100 requests/minute per user)
- Input validation with Pydantic schemas
- CORS configuration for frontend

## Testing

```bash
pytest tests/
```

## Deployment

The backend is containerized and can be deployed using Docker:

```bash
docker build -t spotify-backend .
docker run -p 8000:8000 spotify-backend
```
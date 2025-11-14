# API Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### Verify Token
```http
POST /auth/verify
Content-Type: application/json

{
  "token": "jwt_token_here"
}
```

**Response:**
```json
{
  "valid": true,
  "user_id": "auth0|123456789"
}
```

### Users

#### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "auth0|123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": {
    "genres": ["rap", "pop"],
    "artists": ["Drake", "Taylor Swift"]
  }
}
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "genres": ["rock", "jazz"]
  }
}
```

### Playlists

#### List User Playlists
```http
GET /playlists
Authorization: Bearer <token>
```

**Response:**
```json
{
  "playlists": [
    {
      "id": "uuid-here",
      "name": "My Favorites",
      "song_count": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Playlist
```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Playlist",
  "description": "My awesome playlist"
}
```

#### Get Playlist Details
```http
GET /playlists/{playlist_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "My Favorites",
  "description": "Best songs ever",
  "songs": [
    {
      "id": "song-uuid",
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180
    }
  ]
}
```

### Songs

#### Get Trending Songs
```http
GET /songs/trending?genre=rap&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "songs": [
    {
      "spotify_id": "4iV5W9uYEdYUVa79Axb7Rh",
      "title": "Song Title",
      "artist": "Artist Name",
      "preview_url": "https://p.scdn.co/mp3-preview/...",
      "duration": 180,
      "album": "Album Name"
    }
  ]
}
```

#### Stream Song
```http
GET /songs/{song_id}/stream
Authorization: Bearer <token>
```

**Response:** Audio stream (audio/mpeg)

#### Add to Favorites
```http
POST /songs/{song_id}/favorite
Authorization: Bearer <token>
```

### Admin Endpoints

#### Upload Song
```http
POST /admin/songs
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

file: <audio_file>
title: "Song Title"
artist: "Artist Name"
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or missing token"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded"
}
```

## Rate Limits

- 100 requests per minute per user
- 1000 requests per hour per user
- Admin endpoints: 500 requests per hour

## Pagination

List endpoints support pagination:
```http
GET /playlists?page=1&limit=20
```

**Response:**
```json
{
  "items": [...],
  "page": 1,
  "limit": 20,
  "total": 100,
  "has_next": true
}
```
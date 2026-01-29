"""
Supabase ORM Models for Spotify Project
========================================

This module defines Pydantic models that correspond to Supabase database tables.
These models provide type safety and validation for database operations.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
import re


class BaseSupabaseModel(BaseModel):
    """Base model for all Supabase entities"""
    id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            UUID: lambda v: str(v) if v else None
        }


class UserModel(BaseSupabaseModel):
    """User model corresponding to users table"""
    auth0_id: Optional[str] = None
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    name: Optional[str] = Field(None, max_length=255)
    picture_url: Optional[str] = Field(None, max_length=500)
    updated_at: Optional[datetime] = None
    
    @validator('email')
    def validate_email(cls, v):
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError('Invalid email format')
        return v.lower()


class ArtistModel(BaseSupabaseModel):
    """Artist model corresponding to artists table"""
    name: str = Field(..., max_length=255)
    bio: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Artist name cannot be empty')
        return v.strip()


class AlbumModel(BaseSupabaseModel):
    """Album model corresponding to albums table"""
    title: str = Field(..., max_length=255)
    artist_id: UUID
    cover_image_url: Optional[str] = Field(None, max_length=500)
    release_date: Optional[datetime] = None
    
    # Relationship fields (not stored in DB)
    artist: Optional[ArtistModel] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Album title cannot be empty')
        return v.strip()


class SongModel(BaseSupabaseModel):
    """Song model corresponding to songs table"""
    title: str = Field(..., max_length=255)
    artist_id: Optional[UUID] = None
    album_id: Optional[UUID] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    file_path: str = Field(..., max_length=500)
    cover_image_url: Optional[str] = Field(None, max_length=500)
    
    # Virtual fields (computed)
    audio_url: Optional[str] = None
    artist: Optional[str] = None  # Artist name for simplified queries
    album: Optional[str] = None   # Album title for simplified queries
    
    # Relationship fields
    artist_obj: Optional[ArtistModel] = None
    album_obj: Optional[AlbumModel] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Song title cannot be empty')
        return v.strip()
    
    @validator('duration_seconds')
    def validate_duration(cls, v):
        if v is not None and v < 0:
            raise ValueError('Duration cannot be negative')
        return v
    
    @validator('file_path')
    def validate_file_path(cls, v):
        if not v or not v.strip():
            raise ValueError('File path cannot be empty')
        return v.strip()


class PlaylistModel(BaseSupabaseModel):
    """Playlist model corresponding to playlists table"""
    user_id: UUID
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    is_public: bool = Field(default=False)
    cover_image_url: Optional[str] = Field(None, max_length=500)
    updated_at: Optional[datetime] = None
    
    # Relationship fields
    user: Optional[UserModel] = None
    songs: Optional[List[SongModel]] = []
    song_count: Optional[int] = 0
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Playlist name cannot be empty')
        return v.strip()


class PlaylistSongModel(BaseSupabaseModel):
    """Playlist-Song junction model corresponding to playlist_songs table"""
    playlist_id: UUID
    song_id: UUID
    position: int = Field(..., ge=0)
    added_at: Optional[datetime] = None
    
    # Relationship fields
    playlist: Optional[PlaylistModel] = None
    song: Optional[SongModel] = None
    
    @validator('position')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position cannot be negative')
        return v


class LikedSongModel(BaseSupabaseModel):
    """Liked song model corresponding to liked_songs table"""
    user_id: UUID
    song_id: UUID
    
    # Relationship fields
    user: Optional[UserModel] = None
    song: Optional[SongModel] = None


class TrendingSongModel(BaseSupabaseModel):
    """Trending song model corresponding to trending_songs table"""
    song_id: UUID
    rank_position: int = Field(..., ge=1)
    play_count: Optional[int] = Field(default=0, ge=0)
    trend_date: Optional[datetime] = None
    
    # Relationship fields
    song: Optional[SongModel] = None
    
    @validator('rank_position')
    def validate_rank(cls, v):
        if v < 1:
            raise ValueError('Rank position must be at least 1')
        return v


class TrendingAlbumModel(BaseSupabaseModel):
    """Trending album model corresponding to trending_albums table"""
    album_id: UUID
    rank_position: int = Field(..., ge=1)
    play_count: Optional[int] = Field(default=0, ge=0)
    trend_date: Optional[datetime] = None
    
    # Relationship fields
    album: Optional[AlbumModel] = None


# Request/Response Models for API

class CreateSongRequest(BaseModel):
    """Request model for creating a song"""
    title: str = Field(..., max_length=255)
    artist: str = Field(..., max_length=255)
    album: Optional[str] = Field(None, max_length=255)
    duration_seconds: Optional[int] = Field(None, ge=0)
    cover_image_url: Optional[str] = Field(None, max_length=500)


class UpdateSongRequest(BaseModel):
    """Request model for updating a song"""
    title: Optional[str] = Field(None, max_length=255)
    artist: Optional[str] = Field(None, max_length=255)
    album: Optional[str] = Field(None, max_length=255)
    duration_seconds: Optional[int] = Field(None, ge=0)
    cover_image_url: Optional[str] = Field(None, max_length=500)


class CreatePlaylistRequest(BaseModel):
    """Request model for creating a playlist"""
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    is_public: bool = Field(default=False)
    song_ids: Optional[List[str]] = []


class UpdatePlaylistRequest(BaseModel):
    """Request model for updating a playlist"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_public: Optional[bool] = None


class SearchResponse(BaseModel):
    """Response model for search operations"""
    songs: List[SongModel] = []
    playlists: List[PlaylistModel] = []
    total: int = 0


class PaginatedSongsResponse(BaseModel):
    """Response model for paginated songs"""
    songs: List[SongModel] = []
    page: int = 1
    limit: int = 50
    total: int = 0
    has_next: bool = False
    has_prev: bool = False


class AuthResponse(BaseModel):
    """Response model for authentication"""
    success: bool
    user: Optional[Dict[str, Any]] = None
    session: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ApiResponse(BaseModel):
    """Generic API response model"""
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None


# Utility functions for model conversion

def supabase_row_to_song(row: Dict[str, Any], bucket_name: str = "songs", supabase_url: str = "") -> SongModel:
    """Convert Supabase row to SongModel"""
    audio_url = None
    if row.get('file_path') and supabase_url:
        audio_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{row['file_path']}"
    
    return SongModel(
        id=row.get('id'),
        title=row.get('title'),
        artist=row.get('artist'),
        album=row.get('album'),
        duration_seconds=row.get('duration_seconds'),
        file_path=row.get('file_path'),
        cover_image_url=row.get('cover_image_url'),
        audio_url=audio_url,
        created_at=row.get('created_at')
    )


def supabase_row_to_playlist(row: Dict[str, Any]) -> PlaylistModel:
    """Convert Supabase row to PlaylistModel"""
    return PlaylistModel(
        id=row.get('id'),
        user_id=row.get('user_id'),
        name=row.get('name'),
        description=row.get('description'),
        is_public=row.get('is_public', False),
        cover_image_url=row.get('cover_image_url'),
        created_at=row.get('created_at'),
        updated_at=row.get('updated_at')
    )


def validate_uuid(uuid_string: str) -> bool:
    """Validate UUID string format"""
    try:
        UUID(uuid_string)
        return True
    except ValueError:
        return False


def sanitize_search_query(query: str) -> str:
    """Sanitize search query to prevent SQL injection"""
    if not query:
        return ""
    
    # Remove special characters that could be used for SQL injection
    sanitized = re.sub(r'[^\w\s-]', '', query.strip())
    return sanitized[:100]  # Limit length


# Model validation helpers

class ModelValidator:
    """Helper class for model validation"""
    
    @staticmethod
    def validate_song_data(data: Dict[str, Any]) -> Dict[str, str]:
        """Validate song data and return errors"""
        errors = {}
        
        if not data.get('title', '').strip():
            errors['title'] = 'Title is required'
        
        if not data.get('artist', '').strip():
            errors['artist'] = 'Artist is required'
        
        if not data.get('file_path', '').strip():
            errors['file_path'] = 'File path is required'
        
        duration = data.get('duration_seconds')
        if duration is not None and (not isinstance(duration, int) or duration < 0):
            errors['duration_seconds'] = 'Duration must be a non-negative integer'
        
        return errors
    
    @staticmethod
    def validate_playlist_data(data: Dict[str, Any]) -> Dict[str, str]:
        """Validate playlist data and return errors"""
        errors = {}
        
        if not data.get('name', '').strip():
            errors['name'] = 'Playlist name is required'
        
        if not data.get('user_id'):
            errors['user_id'] = 'User ID is required'
        
        user_id = data.get('user_id')
        if user_id and not validate_uuid(str(user_id)):
            errors['user_id'] = 'Invalid user ID format'
        
        return errors


# Export all models
__all__ = [
    'BaseSupabaseModel',
    'UserModel',
    'ArtistModel', 
    'AlbumModel',
    'SongModel',
    'PlaylistModel',
    'PlaylistSongModel',
    'LikedSongModel',
    'TrendingSongModel',
    'TrendingAlbumModel',
    'CreateSongRequest',
    'UpdateSongRequest',
    'CreatePlaylistRequest',
    'UpdatePlaylistRequest',
    'SearchResponse',
    'PaginatedSongsResponse',
    'AuthResponse',
    'ApiResponse',
    'supabase_row_to_song',
    'supabase_row_to_playlist',
    'validate_uuid',
    'sanitize_search_query',
    'ModelValidator'
]
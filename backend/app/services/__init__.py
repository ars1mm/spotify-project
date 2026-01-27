"""
Services Module

Exports all service classes for easy importing across the application.
"""

from app.services.base import BaseSupabaseClient, get_supabase_client, get_supabase_admin_client
from app.services.auth import AuthService
from app.services.music import SongService, PlaylistService, LikeService, TrendingService, ArtistService
from app.services.admin import AdminService
from app.services.external import SpotifyService, SupabaseService, StorageService

__all__ = [
    "BaseSupabaseClient",
    "get_supabase_client",
    "get_supabase_admin_client",
    "AuthService",
    "SongService",
    "PlaylistService",
    "LikeService",
    "StorageService",
    "TrendingService",
    "ArtistService",
    "AdminService",
    "SpotifyService",
    "SupabaseService",
]

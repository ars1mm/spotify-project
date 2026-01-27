"""
Supabase Service - DEPRECATED

This module is deprecated and will be removed in a future version.
Please import services directly from their respective modules:

- app.services.music.song_service.SongService
- app.services.auth.auth_service.AuthService
- app.services.music.playlist_service.PlaylistService
- app.services.music.like_service.LikeService
- app.services.external.storage_service.StorageService
- app.services.music.trending_service.TrendingService
- app.services.music.artist_service.ArtistService

This wrapper violates the single responsibility principle and adds unnecessary complexity.
"""

import warnings

warnings.warn(
    "SupabaseService is deprecated. Import services directly from their modules.",
    DeprecationWarning,
    stacklevel=2
)

# Legacy compatibility - will be removed
from app.services.music.song_service import SongService
from app.services.auth.auth_service import AuthService
from app.services.music.playlist_service import PlaylistService
from app.services.music.like_service import LikeService
from app.services.external.storage_service import StorageService
from app.services.music.trending_service import TrendingService
from app.services.music.artist_service import ArtistService

class SupabaseService:
    """DEPRECATED: Use individual services directly"""
    def __init__(self, use_service_role: bool = False):
        warnings.warn(
            "SupabaseService is deprecated. Use individual services directly.",
            DeprecationWarning,
            stacklevel=2
        )
        # Minimal implementation for backward compatibility

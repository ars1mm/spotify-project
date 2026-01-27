"""
Music Services Module

Handles music-related operations including songs, artists, playlists, etc.
"""

from .song_service import SongService
from .artist_service import ArtistService
from .playlist_service import PlaylistService
from .like_service import LikeService
from .trending_service import TrendingService

__all__ = [
    "SongService",
    "ArtistService",
    "PlaylistService",
    "LikeService",
    "TrendingService",
]
"""
Supabase Service - Compatibility Layer

This module provides backward compatibility by wrapping the new service classes.
New code should import services directly from their respective modules.
"""

from typing import Optional, List
from app.services.music.song_service import SongService
from app.services.auth.auth_service import AuthService
from app.services.music.playlist_service import PlaylistService
from app.services.music.like_service import LikeService
from app.services.external.storage_service import StorageService
from app.services.music.trending_service import TrendingService
from app.services.music.artist_service import ArtistService


class SupabaseService:
    def __init__(self, use_service_role: bool = False):
        self.song_service = SongService(use_service_role=use_service_role)
        self.auth_service = AuthService(use_service_role=use_service_role)
        self.playlist_service = PlaylistService(use_service_role=use_service_role)
        self.like_service = LikeService(use_service_role=use_service_role)
        self.storage_service = StorageService(use_service_role=use_service_role)
        self.trending_service = TrendingService(use_service_role=use_service_role)
        self.artist_service = ArtistService(use_service_role=use_service_role)

    def list_songs(self, page: int = 1, limit: int = 50):
        return self.song_service.list_songs(page=page, limit=limit)

    def get_trending_songs(self, limit: int = 10):
        return self.trending_service.get_trending_songs(limit=limit)

    def get_trending_albums(self, limit: int = 10):
        return self.trending_service.get_trending_albums(limit=limit)

    def create_user(self, email: str, password: str, name: str):
        return self.auth_service.create_user(email=email, password=password, name=name)

    def login_user(self, email: str, password: str):
        return self.auth_service.login_user(email=email, password=password)

    def reset_password(self, email: str):
        return self.auth_service.reset_password(email=email)

    def update_password(self, access_token: str, refresh_token: str, new_password: str):
        return self.auth_service.update_password(access_token=access_token, refresh_token=refresh_token, new_password=new_password)

    def search_songs(self, query: str, limit: int = 10):
        return self.song_service.search_songs(query=query, limit=limit)

    def upload_file(self, file_content: bytes, file_path: str, content_type: str):
        return self.storage_service.upload_file(file_content, file_path, content_type)

    def insert_song(self, song_data: dict):
        return self.song_service.insert_song(song_data)

    def delete_song(self, song_id: str):
        return self.song_service.delete_song(song_id)

    def upload_cover(self, file_content: bytes, file_path: str, content_type: str):
        return self.storage_service.upload_cover(file_content, file_path, content_type)

    def create_playlist(self, name: str, description: str, is_public: bool, user_id: str, song_ids: Optional[List[str]] = None):
        return self.playlist_service.create_playlist(name, description, is_public, user_id, song_ids or [])

    def get_playlists(self, user_id: Optional[str] = None, public_only: bool = False):
        return self.playlist_service.get_playlists(user_id or None, public_only)

    def get_playlist_by_id(self, playlist_id: str):
        return self.playlist_service.get_playlist_by_id(playlist_id)

    def update_playlist(self, playlist_id: str, name: Optional[str] = None, description: Optional[str] = None, is_public: Optional[bool] = None):
        return self.playlist_service.update_playlist(playlist_id, name, description, is_public)

    def remove_song_from_playlist(self, playlist_id: str, song_id: str):
        return self.playlist_service.remove_song_from_playlist(playlist_id, song_id)

    def add_song_to_playlist(self, playlist_id: str, song_id: str):
        return self.playlist_service.add_song_to_playlist(playlist_id, song_id)

    def get_unique_artists(self):
        return self.artist_service.get_unique_artists()

    def like_song(self, user_id: str, song_id: str):
        return self.like_service.like_song(user_id, song_id)

    def unlike_song(self, user_id: str, song_id: str):
        return self.like_service.unlike_song(user_id, song_id)

    def get_liked_songs(self, user_id: str):
        return self.like_service.get_liked_songs(user_id)

    def is_song_liked(self, user_id: str, song_id: str):
        return self.like_service.is_song_liked(user_id, song_id)

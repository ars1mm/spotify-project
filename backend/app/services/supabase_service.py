import os
from app.utils.supabase_client import SupabaseStorageClient

class SupabaseService:
    def __init__(self, use_service_role: bool = False):
        self.client = SupabaseStorageClient(use_service_role=use_service_role)

    def list_songs(self, page: int = 1, limit: int = 50):
        return self.client.list_songs(page=page, limit=limit)
    
    def get_trending_songs(self, limit: int = 10):
        return self.client.get_trending_songs(limit=limit)
    
    def get_trending_albums(self, limit: int = 10):
        return self.client.get_trending_albums(limit=limit)
    
    def create_user(self, email: str, password: str, name: str):
        return self.client.create_user(email=email, password=password, name=name)
    
    def login_user(self, email: str, password: str):
        return self.client.login_user(email=email, password=password)
    
    def reset_password(self, email: str):
        return self.client.reset_password(email=email)
    
    def update_password(self, access_token: str, refresh_token: str, new_password: str):
        return self.client.update_password(access_token=access_token, refresh_token=refresh_token, new_password=new_password)
    
    def search_songs(self, query: str, limit: int = 10):
        return self.client.search_songs(query=query, limit=limit)

    def upload_file(self, file_content: bytes, file_path: str, content_type: str):
        return self.client.upload_file(file_content, file_path, content_type)

    def insert_song(self, song_data: dict):
        return self.client.insert_song(song_data)
    
    def delete_song(self, song_id: str):
        return self.client.delete_song(song_id)
    
    def upload_cover(self, file_content: bytes, file_path: str, content_type: str):
        return self.client.upload_cover(file_content, file_path, content_type)
    
    def create_playlist(self, name: str, description: str, is_public: bool, user_id: str, song_ids: list = []):
        return self.client.create_playlist(name, description, is_public, user_id, song_ids)
    
    def get_playlists(self, user_id: str = None, public_only: bool = False):
        return self.client.get_playlists(user_id, public_only)
    
    def get_playlist_by_id(self, playlist_id: str):
        return self.client.get_playlist_by_id(playlist_id)
    
    def update_playlist(self, playlist_id: str, name: str = None, description: str = None, is_public: bool = None):
        return self.client.update_playlist(playlist_id, name, description, is_public)
    
    def remove_song_from_playlist(self, playlist_id: str, song_id: str):
        return self.client.remove_song_from_playlist(playlist_id, song_id)
    
    def add_song_to_playlist(self, playlist_id: str, song_id: str):
        return self.client.add_song_to_playlist(playlist_id, song_id)

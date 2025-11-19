import os
from app.utils.supabase_client import SupabaseStorageClient

class SupabaseService:
    def __init__(self):
        self.client = SupabaseStorageClient()

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
    
    def update_password(self, access_token: str, new_password: str):
        return self.client.update_password(access_token=access_token, new_password=new_password)
    
    def search_songs(self, query: str, limit: int = 10):
        return self.client.search_songs(query=query, limit=limit)

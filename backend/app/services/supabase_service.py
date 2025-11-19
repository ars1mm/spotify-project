import os
from app.utils.supabase_client import SupabaseStorageClient

class SupabaseService:
    def __init__(self):
        self.client = SupabaseStorageClient()

    def list_songs(self, page: int = 1, limit: int = 50):
        return self.client.list_songs(page=page, limit=limit)

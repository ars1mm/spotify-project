"""
Base Supabase Client Module

Provides shared Supabase client initialization and configuration
for all service modules.
"""

import os
from supabase import create_client, Client

_supabase_client = None
_supabase_admin_client = None


def get_supabase_client() -> Client:
    """Get or create Supabase client instance with anon key (for public operations)"""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")

        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

        _supabase_client = create_client(url, key)

    return _supabase_client


def get_supabase_admin_client() -> Client:
    """Get or create Supabase admin client instance with service role key (for admin operations)"""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

        _supabase_admin_client = create_client(url, key)

    return _supabase_admin_client


class BaseSupabaseClient:
    """Base class for Supabase service clients with common functionality"""

    def __init__(self, use_service_role: bool = False):
        url = os.getenv("SUPABASE_URL")

        if use_service_role:
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        else:
            key = os.getenv("SUPABASE_ANON_KEY")
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

        self.supabase: Client = create_client(url, key)
        self.bucket_name = os.getenv("SUPABASE_BUCKET_NAME", "songs")
        self.supabase_url = url

    def _get_audio_url(self, file_path: str) -> str | None:
        """Generate public URL for an audio file"""
        if not file_path:
            return None
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{file_path}"

"""
Base Services Module

Provides base client classes and utilities.
"""

from .base_client import BaseSupabaseClient, get_supabase_client, get_supabase_admin_client

__all__ = [
    "BaseSupabaseClient",
    "get_supabase_client",
    "get_supabase_admin_client",
]
"""
Artist Service Module

Handles artist-related queries.
"""

from typing import List
from app.services.base.base_client import BaseSupabaseClient


class ArtistService(BaseSupabaseClient):
    """Service for artist-related operations"""

    def get_unique_artists(self) -> List[str]:
        """Get list of unique artist names from songs table"""
        try:
            response = self.supabase.table("songs").select("artist").execute()
            artists = list(set([song['artist'] for song in response.data if song.get('artist')]))
            return sorted(artists)
        except Exception as e:
            print(f"Error fetching artists: {str(e)}")
            return []

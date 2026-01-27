"""
Trending Service Module

Handles trending songs and albums queries.
"""

from typing import Dict
from app.services.base.base_client import BaseSupabaseClient


class TrendingService(BaseSupabaseClient):
    """Service for trending content operations"""

    def get_trending_songs(self, limit: int = 10) -> Dict:
        """Get trending songs from database"""
        try:
            response = self.supabase.table("trending_songs").select(
                "*, songs(title, artist, album, cover_image_url)"
            ).order("rank_position").limit(limit).execute()

            return {"trending_songs": response.data}
        except Exception as e:
            return {"error": str(e), "trending_songs": []}

    def get_trending_albums(self, limit: int = 10) -> Dict:
        """Get trending albums from database"""
        try:
            response = self.supabase.table("trending_albums").select(
                "*"
            ).order("rank_position").limit(limit).execute()

            return {"trending_albums": response.data}
        except Exception as e:
            return {"error": str(e), "trending_albums": []}

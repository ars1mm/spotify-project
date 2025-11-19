import requests
import json
import os

class AdminClient:
    def __init__(self, base_url="http://localhost:8000", admin_token=None):
        self.base_url = base_url
        self.admin_token = admin_token or os.getenv("ADMIN_SECRET_KEY", "admin-secret-key-123")
        self.headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
    
    def bulk_insert_songs(self, songs_data):
        """Bulk insert songs"""
        response = requests.post(
            f"{self.base_url}/api/v1/admin/songs/bulk",
            headers=self.headers,
            json=songs_data
        )
        return response.json()
    
    def update_song(self, song_id, update_data):
        """Update song"""
        response = requests.put(
            f"{self.base_url}/api/v1/admin/songs/{song_id}",
            headers=self.headers,
            json=update_data
        )
        return response.json()
    
    def update_trending_songs(self, trending_data):
        """Update trending songs"""
        response = requests.post(
            f"{self.base_url}/api/v1/admin/trending/songs",
            headers=self.headers,
            json=trending_data
        )
        return response.json()
    
    def get_top_songs(self, limit=50):
        """Get top songs"""
        response = requests.get(
            f"{self.base_url}/api/v1/admin/analytics/top-songs?limit={limit}",
            headers=self.headers
        )
        return response.json()

# Usage example
if __name__ == "__main__":
    client = AdminClient()
    
    # Test bulk insert
    songs = [
        {
            "title": "Test Song",
            "artist": "Test Artist",
            "album": "Test Album",
            "duration_seconds": 180,
            "file_path": "/songs/test.mp3"
        }
    ]
    
    result = client.bulk_insert_songs(songs)
    print(json.dumps(result, indent=2))
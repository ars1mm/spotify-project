#!/usr/bin/env python3
from admin_client import AdminClient
import uuid

def populate_sample_data():
    """Populate database with sample data"""
    client = AdminClient()
    
    # Sample songs data with artist/album structure
    songs_data = [
        {
            "title": "Blinding Lights",
            "artist_name": "The Weeknd",
            "album_name": "After Hours",
            "duration_seconds": 200,
            "cover_image_url": "https://example.com/cover1.jpg",
            "file_path": "/songs/blinding_lights.mp3"
        },
        {
            "title": "Shape of You",
            "artist_name": "Ed Sheeran", 
            "album_name": "÷ (Divide)",
            "duration_seconds": 233,
            "cover_image_url": "https://example.com/cover2.jpg",
            "file_path": "/songs/shape_of_you.mp3"
        },
        {
            "title": "Bad Guy",
            "artist_name": "Billie Eilish",
            "album_name": "When We All Fall Asleep, Where Do We Go?",
            "duration_seconds": 194,
            "cover_image_url": "https://example.com/cover3.jpg",
            "file_path": "/songs/bad_guy.mp3"
        }
    ]
    
    print("📀 Inserting sample songs...")
    result = client.bulk_insert_songs(songs_data)
    print(f"✅ Songs inserted: {result}")
    
    # Sample trending data
    trending_data = [
        {"song_id": songs_data[0]["id"], "rank_position": 1},
        {"song_id": songs_data[1]["id"], "rank_position": 2},
        {"song_id": songs_data[2]["id"], "rank_position": 3}
    ]
    
    print("\n🔥 Setting trending songs...")
    trending_result = client.update_trending_songs(trending_data)
    print(f"✅ Trending updated: {trending_result}")

if __name__ == "__main__":
    populate_sample_data()
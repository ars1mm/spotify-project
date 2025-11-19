#!/usr/bin/env python3
"""
Admin setup script for bulk operations and data management
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.admin_service import AdminService
import json

def bulk_insert_sample_songs():
    """Insert sample songs for testing"""
    admin = AdminService()
    
    sample_songs = [
        {
            "title": "Blinding Lights",
            "artist": "The Weeknd",
            "album": "After Hours",
            "duration_seconds": 200,
            "file_path": "/songs/blinding-lights.mp3",
            "cover_image_url": "/covers/after-hours.jpg"
        },
        {
            "title": "Watermelon Sugar",
            "artist": "Harry Styles",
            "album": "Fine Line",
            "duration_seconds": 174,
            "file_path": "/songs/watermelon-sugar.mp3",
            "cover_image_url": "/covers/fine-line.jpg"
        },
        {
            "title": "Levitating",
            "artist": "Dua Lipa",
            "album": "Future Nostalgia",
            "duration_seconds": 203,
            "file_path": "/songs/levitating.mp3",
            "cover_image_url": "/covers/future-nostalgia.jpg"
        }
    ]
    
    result = admin.bulk_insert_songs(sample_songs)
    print(f"Bulk insert result: {json.dumps(result, indent=2)}")

def update_trending_data():
    """Update trending songs and albums"""
    admin = AdminService()
    
    # First, get some song IDs (you'll need to replace with actual IDs)
    trending_songs = [
        {"song_id": "replace-with-actual-id", "rank_position": 1, "trend_score": 95.5},
        {"song_id": "replace-with-actual-id", "rank_position": 2, "trend_score": 92.3},
    ]
    
    trending_albums = [
        {
            "album_name": "Midnights",
            "artist_name": "Taylor Swift",
            "album_cover_url": "/covers/midnights.jpg",
            "rank_position": 1,
            "trend_score": 95.5,
            "release_date": "2022-10-21"
        }
    ]
    
    songs_result = admin.update_trending_songs(trending_songs)
    albums_result = admin.update_trending_albums(trending_albums)
    
    print(f"Trending songs result: {json.dumps(songs_result, indent=2)}")
    print(f"Trending albums result: {json.dumps(albums_result, indent=2)}")

if __name__ == "__main__":
    print("Admin Setup Script")
    print("1. Bulk insert sample songs")
    print("2. Update trending data")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == "1":
        bulk_insert_sample_songs()
    elif choice == "2":
        update_trending_data()
    else:
        print("Invalid choice")
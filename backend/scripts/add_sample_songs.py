#!/usr/bin/env python3
"""
Script to add sample songs to the database
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def add_sample_songs():
    # Initialize Supabase client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for admin operations
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return
    
    supabase = create_client(url, key)
    
    # Sample songs data
    sample_songs = [
        {
            "title": "Shape of You",
            "artist": "Ed Sheeran",
            "album": "÷ (Divide)",
            "duration_seconds": 233,
            "file_path": "songs/ed_sheeran_shape_of_you.mp3",
            "cover_image_url": "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96"
        },
        {
            "title": "Blinding Lights",
            "artist": "The Weeknd",
            "album": "After Hours",
            "duration_seconds": 200,
            "file_path": "songs/the_weeknd_blinding_lights.mp3",
            "cover_image_url": "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36"
        },
        {
            "title": "Watermelon Sugar",
            "artist": "Harry Styles",
            "album": "Fine Line",
            "duration_seconds": 174,
            "file_path": "songs/harry_styles_watermelon_sugar.mp3",
            "cover_image_url": "https://i.scdn.co/image/ab67616d0000b273277b3fd1c0b7e8a9b2b8b1b1"
        },
        {
            "title": "Levitating",
            "artist": "Dua Lipa",
            "album": "Future Nostalgia",
            "duration_seconds": 203,
            "file_path": "songs/dua_lipa_levitating.mp3",
            "cover_image_url": "https://i.scdn.co/image/ab67616d0000b273ef968e4c5c0e7e5b9b8b1b1b"
        },
        {
            "title": "Good 4 U",
            "artist": "Olivia Rodrigo",
            "album": "SOUR",
            "duration_seconds": 178,
            "file_path": "songs/olivia_rodrigo_good_4_u.mp3",
            "cover_image_url": "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a"
        }
    ]
    
    try:
        # Insert sample songs
        result = supabase.table("songs").insert(sample_songs).execute()
        print(f"Successfully added {len(sample_songs)} sample songs to the database!")
        print("Songs added:")
        for song in sample_songs:
            print(f"- {song['title']} by {song['artist']}")
            
    except Exception as e:
        print(f"Error adding sample songs: {str(e)}")

if __name__ == "__main__":
    add_sample_songs()
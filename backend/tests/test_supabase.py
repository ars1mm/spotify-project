#!/usr/bin/env python3
"""Test client for Supabase bucket song fetching"""

import asyncio
from app.utils.supabase_client import SupabaseStorageClient
from dotenv import load_dotenv

async def test_fetch_songs():
    load_dotenv()
    
    client = SupabaseStorageClient()
    
    # Test pagination
    for page in range(1, 4):  # Test first 3 pages
        print(f"\n--- Page {page} ---")
        result = client.list_songs(page=page, limit=50)
        
        if result.get("error"):
            print(f"Error: {result['error']}")
            break
            
        print(f"Found {result['total']} songs on page {page}")
        for song in result["songs"][:5]:  # Show first 5 songs
            print(f"  - {song['name']} ({song['size']} bytes)")
        
        if result["total"] < 50:  # Last page
            break

if __name__ == "__main__":
    asyncio.run(test_fetch_songs())
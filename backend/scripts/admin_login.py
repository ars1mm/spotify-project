#!/usr/bin/env python3
import os
import requests
from admin_client import AdminClient

def admin_login():
    """Simple admin login using environment token"""
    admin_token = os.getenv("ADMIN_SECRET_KEY", "admin-secret-key-123")
    base_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
    
    print(f"🔑 Admin Token: {admin_token}")
    print(f"🌐 API URL: {base_url}")
    
    # Test admin access
    client = AdminClient(base_url, admin_token)
    
    try:
        result = client.get_top_songs(limit=1)
        print("[ADMIN]Admin authentication successful!")
        return client
    except Exception as e:
        print(f"❌ Admin authentication failed: {e}")
        return None

if __name__ == "__main__":
    client = admin_login()
    if client:
        print("\n📋 Available admin operations:")
        print("- client.bulk_insert_songs(songs_data)")
        print("- client.update_trending_songs(trending_data)")
        print("- client.get_top_songs(limit)")
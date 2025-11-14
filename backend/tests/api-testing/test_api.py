import http.client
import os
from dotenv import load_dotenv

load_dotenv()

def test_rapidapi():
    conn = http.client.HTTPSConnection(os.getenv("RAPIDAPI_HOST"))
    
    headers = {
        'x-rapidapi-key': os.getenv("RAPIDAPI_KEY"),
        'x-rapidapi-host': os.getenv("RAPIDAPI_HOST")
    }
    
    # Test with a simple track (URL encoded)
    import urllib.parse
    track_name = "Lego House Ed Sheeran"
    encoded_track = urllib.parse.quote(track_name)
    conn.request("GET", f"/v1/track/download?track={encoded_track}", headers=headers)
    
    res = conn.getresponse()
    data = res.read()
    
    print(f"Status Code: {res.status}")
    print(f"Response Headers: {dict(res.getheaders())}")
    print(f"Response Data: {data.decode('utf-8')}")
    
    return data.decode("utf-8")

if __name__ == "__main__":
    test_rapidapi()
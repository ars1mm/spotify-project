import os
import logging
import boto3
from botocore.exceptions import ClientError
from typing import List, Dict, Optional

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SupabaseStorageClient:
    def __init__(self):
        endpoint = os.getenv("BUCKET_ENDPOINT")
        region = os.getenv("BUCKET_REGION")
        access_key = os.getenv("ACCESS_KEY_ID")
        secret_key = os.getenv("SECRET_ACCESS_KEY")
        
        logger.debug(f"Initializing S3 client with endpoint: {endpoint}")
        logger.debug(f"Using region: {region}")
        logger.debug(f"Using access key: {access_key[:10]}..." if access_key else "No access key found")
        
        if not all([endpoint, access_key, secret_key]):
            logger.error("Missing S3 credentials in environment variables")
            raise ValueError("BUCKET_ENDPOINT, ACCESS_KEY_ID, and SECRET_ACCESS_KEY must be set")
        
        self.s3_client = boto3.client(
            's3',
            endpoint_url=endpoint,
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )
        self.bucket_name = "songs"
        logger.debug(f"Using bucket: {self.bucket_name}")
    
    def list_songs(self, page: int = 1, limit: int = 50) -> Dict:
        """Fetch songs from S3 bucket with pagination"""
        logger.debug(f"Fetching songs - Page: {page}, Limit: {limit}")
        
        try:
            # S3 pagination using marker
            kwargs = {'Bucket': self.bucket_name, 'MaxKeys': limit}
            if page > 1:
                # Get marker from previous page (simplified approach)
                prev_response = self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    MaxKeys=(page - 1) * limit
                )
                if 'Contents' in prev_response and len(prev_response['Contents']) >= (page - 1) * limit:
                    kwargs['StartAfter'] = prev_response['Contents'][-1]['Key']
            
            logger.debug(f"Listing objects from bucket: {self.bucket_name}")
            response = self.s3_client.list_objects_v2(**kwargs)
            
            if 'Contents' not in response:
                logger.debug("No objects found in bucket")
                return {"songs": [], "page": page, "limit": limit, "total": 0}
            
            objects = response['Contents']
            logger.debug(f"Raw response from S3: {len(objects)} files")
            if objects:
                logger.debug(f"First file example: {objects[0]['Key']}")
            
            # Filter audio files only
            audio_extensions = {'.mp3', '.wav', '.flac', '.m4a', '.ogg'}
            logger.debug(f"Filtering for audio extensions: {audio_extensions}")
            
            songs = []
            for obj in objects:
                key = obj['Key']
                logger.debug(f"Processing file: {key}")
                
                if any(key.lower().endswith(ext) for ext in audio_extensions):
                    try:
                        # Generate public URL
                        url = f"{os.getenv('BUCKET_ENDPOINT').replace('/storage/v1/s3', '')}/object/public/{self.bucket_name}/{key}"
                        
                        song_data = {
                            "name": key,
                            "size": obj['Size'],
                            "url": url,
                            "created_at": obj['LastModified'].isoformat()
                        }
                        songs.append(song_data)
                        logger.debug(f"Added song: {song_data['name']}")
                    except KeyError as ke:
                        logger.warning(f"Missing key in object metadata: {ke} for file {key}")
                else:
                    logger.debug(f"Skipped non-audio file: {key}")
            
            result = {
                "songs": songs,
                "page": page,
                "limit": limit,
                "total": len(songs)
            }
            
            logger.info(f"Successfully fetched {len(songs)} songs on page {page}")
            return result
            
        except ClientError as e:
            logger.error(f"S3 Client error: {e}")
            logger.exception("Full exception details:")
            return {"error": str(e), "songs": [], "page": page, "limit": limit, "total": 0}
        except Exception as e:
            logger.error(f"Error fetching songs: {str(e)}")
            logger.exception("Full exception details:")
            return {"error": str(e), "songs": [], "page": page, "limit": limit, "total": 0}


if __name__ == "__main__":
    from dotenv import load_dotenv
    
    print("Loading environment variables...")
    load_dotenv()
    
    try:
        client = SupabaseStorageClient()
        result = client.list_songs(page=1, limit=10)
        
        if result.get("error"):
            print(f"\nERROR: {result['error']}")
        else:
            print(f"\nSUCCESS: Found {result['total']} songs")
            for song in result['songs']:
                print(f"  - {song['name']}")
                
    except Exception as e:
        print(f"\nFAILED TO INITIALIZE: {e}")
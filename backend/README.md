# Spotify Backend API

## API Routes

### Base URL
- Local: `http://localhost:8000`
- Production: TBD

### Endpoints

#### GET `/`
- **Description**: Health check endpoint
- **Response**: `{"message": "Spotify Backend API"}`

#### GET `/api/v1/track/download`
- **Description**: Download track information from Spotify
- **Parameters**: 
  - `track` (query): Track name (e.g., "Lego House Ed Sheeran")
- **Response**: `{"data": "track_info"}`
- **Error Response**: `{"error": "error_message"}`

### Interactive Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Setup

### Local Development
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker
```bash
# Quick start (Windows)
.\scripts\run-docker.bat

# Quick start (Linux/Mac)
./scripts/run-docker.sh

# Manual (with rate limiting in memory)
docker build -t spotify-backend .
docker run --name spotify-backend -p 8000:8000 spotify-backend

# With Redis for persistent rate limiting
docker run -d --name redis redis:7-alpine
docker run --name spotify-backend --link redis -e REDIS_URL=redis://redis:6379 -p 8000:8000 spotify-backend

# To stop and remove container
docker stop spotify-backend
docker rm spotify-backend
docker build -t spotify-backend .
docker run --name spotify-backend -p 127.0.0.1:8000:8000 spotify-backend
```

### Kubernetes
```bash
# Create secret from template
cp k8s/secret-template.yaml k8s/secret.yaml
# Edit secret.yaml with your base64 encoded API key
echo -n "your_api_key" | base64
# Apply configurations
kubectl apply -f k8s/
```
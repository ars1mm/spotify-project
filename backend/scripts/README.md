# Admin Scripts

## Quick Start

1. **Login as admin:**
```bash
cd backend/scripts
python admin_login.py
```

2. **Populate sample data:**
```bash
python populate_data.py
```

## Admin Token

Set in `.env` file:
```
ADMIN_SECRET_KEY=admin-secret-key-123
```

## API Usage

Use the token in Authorization header:
```
Authorization: Bearer admin-secret-key-123
```

## Available Endpoints

- `POST /api/v1/admin/songs/bulk` - Bulk insert songs
- `POST /api/v1/admin/trending/songs` - Update trending songs
- `GET /api/v1/admin/analytics/top-songs` - Get top songs
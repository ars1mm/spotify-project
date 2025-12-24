# Dokumentimi i API (Endpoints)

Ky dokument përmbledh endpoint-et kryesore të REST API-së që ofron backend-i (FastAPI). Të gjitha endpoint-et përdorin formate JSON dhe autentifikimi bëhet kryesisht me Bearer JWT.

## Prefix

Të gjitha endpoint-et kryesore janë nën `/api/v1/`.

## Autentifikimi

POST `/api/v1/auth/register` — Regjistrim përdoruesi (body JSON: `email`, `password`, `name`).

POST `/api/v1/auth/login` — Login; kthen `access_token` dhe `user`.

POST `/api/v1/auth/refresh` — Gjeneron token të ri.

POST `/api/v1/auth/logout` — Logout (opsional, client-side token removal).

## Songs

GET `/api/v1/songs` — Merr listën e këngëve (query params: `page`, `limit`).

POST `/api/v1/songs` — Upload këngë (multipart/form-data: `file`, `title`, `artist`, `album`, `cover_image`).

GET `/api/v1/songs/{song_id}` — Detaje këngë.

PUT `/api/v1/songs/{song_id}` — Përditëso metadata.

DELETE `/api/v1/songs/{song_id}` — Fshi këngën (admin ose uploader).

## Playlists

GET `/api/v1/playlists` — Merr playlists e përdoruesit / publike.

POST `/api/v1/playlists` — Krijo playlist.

POST `/api/v1/playlists/{playlist_id}/songs/{song_id}` — Shto këngë në playlist.

DELETE `/api/v1/playlists/{playlist_id}/songs/{song_id}` — Heq këngë nga playlist.

## Search

GET `/api/v1/search?q={query}` — Kërkim (kërkon `songs` dhe `playlists`).

## Users & Admin

GET `/api/v1/users/{user_id}` — Merr profil publik.

GET `/api/v1/admin/users` — Admin-only: lista e përdoruesve.

## Error Format

Gabimet kthehen me strukturë të thjeshtë JSON, p.sh.:

```json
{ "error": "Message", "status_code": 400 }
```

## Shembuj curl

```bash
# Login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  http://localhost:8000/api/v1/auth/login

# List songs
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/songs
```

## Shënime

- Përdorni HTTPS në production.
- Përdorni header-in `Authorization: Bearer <token>` për endpoints të mbrojtura.

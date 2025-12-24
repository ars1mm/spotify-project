# Dokumentimi Detajuar i Backend-it (FastAPI)

Ky seksion përmban informacionin teknik për serverin e aplikacionit, i ndërtuar me FastAPI dhe i integruar me Supabase.

## Përmbajtja

1.  **[Struktura dhe Arkitektura](01-struktura-dhe-arkitektura.md)**
    - Organizimi i dosjeve, teknologjitë dhe shërbimet e jashtme.
2.  **[Referenca e API-t (Endpoints)](02-api-endpoints.md)**
    - Lista e plotë e të gjitha rrugëve për Auth, Këngë, Playlist-a dhe Admin.
3.  **[Shërbimet e Sistemit (Services)](03-sherbimet.md)**
    - Logjika pas SupabaseService, SpotifyService dhe AdminService.
4.  **[Siguria dhe Autentifikimi](04-siguria-dhe-autentifikimi.md)**
    - JWT, Rate Limiting (SlowAPI), CORS dhe RLS.
5.  **[Paneli i Administrimit](05-admin-panel.md)**
    - Menaxhimi i këngëve, ngarkimi i skedarëve dhe statistikat.

6.  **[Middleware Admin](06-middleware-admin.md)**
    - Verifikimi i autorizimit për veprime administrative.
7.  **[Rate Limiter](07-rate-limiter.md)**
    - Kufizimi i kërkesave për të parandaluar abuzimet.

## Si të filloni me zhvillimin?

Për të nisur serverin në ambientin lokal:

1.  Navigoni te dosja e backend-it: `cd backend`
2.  Krijoni një ambient virtual: `python -m venv venv`
3.  Aktivizoni ambientin: `venv\Scripts\activate` (Windows)
4.  Instaloni varësitë: `pip install -r requirements.txt`
5.  Nisni serverin: `fastapi dev app/main.py` ose `uvicorn app.main:app --reload`

Serveri do të jetë i disponueshëm në `http://localhost:8000`.
Dokumentimi interaktiv i API (Swagger UI): `http://localhost:8000/docs`.

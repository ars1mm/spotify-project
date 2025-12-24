# Siguria dhe Autentifikimi

Backend-i i projektit implementon standarde moderne të sigurisë për të mbrojtur të dhënat dhe për të parandaluar abuzimet.

## Autentifikimi me JWT

Sistemi përdor **Supabase Auth** për menaxhimin e përdoruesve.
-   Pas identifikimit të suksesshëm, frontend-i merr një **JWT (JSON Web Token)**.
-   Ky token dërgohet në çdo kërkesë API përmes header-it `Authorization: Bearer <token>`.
-   Backend-i verifikon vlefshmërinë e token-it me Supabase përpara se të lejojë aksesin në të dhëna private.

## Rate Limiting (Kufizimi i Kërkesave)

Për të parandaluar sulmet "Brute Force" dhe abuzimin me kërkesat API (veçanërisht në kërkimin e Spotify), ne përdorim **SlowAPI** (bazuar në Redis ose in-memory).

**Konfigurimi:**
```python
@router.get("/track/download")
@limiter.limit("60/30seconds")
def download_track(request: Request, track: str):
    # Logjika këtu...
```
-   Ky shembull lejon vetëm 60 kërkesa çdo 30 sekonda për një adresë IP specifike.

## CORS (Cross-Origin Resource Sharing)

Për të lejuar që frontend-i ynë (që mund të jetë në një domain tjetër) të komunikojë me backend-in, ne kemi konfiguruar CORS me rregulla specifike:
-   Lejohen vetëm domain-et e besuara (p.sh. `localhost:3000`, `vazhdimesia.vercel.app`).
-   Lejohen vetëm metodat e nevojshme (GET, POST, PUT, DELETE).
-   Lejohen header-at e autentifikimit.

## Admin Access Control (RBAC)

Aksesi në panelin e administrimit është i mbrojtur në dy nivele:
1.  **JWT Verification**: Përdoruesi duhet të jetë i identifikuar.
2.  **Service Role / Role Check**: Sistemi kontrollon nëse përdoruesi ka rolin `admin` në bazën e të dhënave, ose përdor `SUPABASE_SERVICE_ROLE_KEY` për operacione që anashkalojnë RLS (Row Level Security).

## Row Level Security (RLS)

Në nivel të bazës së të dhënave në Supabase, janë aktivizuar politikat RLS:
-   Përdoruesit mund të shohin vetëm playlist-at e tyre private.
-   Përdoruesit nuk mund të fshijnë këngë që nuk i kanë ngarkuar vetë (nëse sistemi do ta lejonte këtë).
-   Të gjithë mund të shohin këngët publike dhe playlist-at publike.

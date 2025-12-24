# Struktura dhe Arkitektura e Backend-it

Ky dokument detajon arkitekturën e serverit dhe organizimin e kodit burimor të backend-it.

## Arkitektura e Dosjeve

Backend-i është ndërtuar me **FastAPI** dhe ndjek një strukturë modulare për të ndarë përgjegjësitë:

```text
backend/
├── app/
│   ├── api/                  # Rrugët (Routes) e API-t
│   │   ├── routes.py         # Endpoints kryesore (Auth, Songs, Search)
│   │   └── admin.py          # Endpoints për panelin e administrimit
│   ├── core/                 # Konfigurimet qendrore dhe siguria
│   │   ├── config.py         # Variablat e mjedisit dhe cilësimet
│   │   └── rate_limiter.py   # Konfigurimi i SlowAPI për mbrojtje
│   ├── models/               # Modelet e të dhënave (nëse përdoren ORM)
│   ├── schemas/              # Pydantic models për validimin e kërkesave/përgjigjeve
│   ├── services/             # Logjika e biznesit (Services)
│   │   ├── supabase_service.py # Ndërveprimi me Supabase (DB & Storage)
│   │   ├── spotify_service.py  # Integrimi me Spotify API
│   │   └── admin_service.py    # Logjika specifike për admin
│   ├── middleware/           # Middleware për CORS, Logging, etj.
│   └── main.py               # Entry point i aplikacionit
├── sql/                      # Skemat e bazës së të dhënave (PostgreSQL)
├── scripts/                  # Script-e ndihmëse për mirëmbajtje
└── requirements.txt          # Varësitë e Python
```

## Teknologjitë Kryesore

- **FastAPI**: Framework-u kryesor për ndërtimin e API-ve të shpejta dhe asinkrone.
- **Supabase (PostgreSQL)**: Përdoret si baza e të dhënave kryesore, sistemi i autentifikimit dhe ruajtja e skedarëve (Storage).
- **Redis (optional/infra)**: Përdoret për caching dhe rate limiting (përmes SlowAPI).
- **Pydantic**: Për validimin e të dhënave dhe modelimin e skemave.
- **Spotify API**: Përdoret për të marrë informacione rreth këngëve (metadata, covers, download info).

## Konfigurimi i Sistemit

Aplikacioni konfigurohet përmes skedarit `.env`. Disa nga variablat kryesore përfshijnë:

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

## Logjika e Shërbimeve (Services)

Backend-i përdor "Service Pattern" për të ndarë logjikën e API-t nga ndërveprimi me bazën e të dhënave ose shërbimet e jashtme:

1.  **SupabaseService**: Menaxhon të gjitha thirrjet drejt Supabase, përfshirë CRUD për këngët dhe playlist-at.
2.  **SpotifyService**: Komunikon me API-n e Spotify për kërkimin e këngëve dhe marrjen e metadata-ve.
3.  **AdminService**: Trajton veprimet që kërkojnë privilegje të larta, si ngarkimi i këngëve të reja.

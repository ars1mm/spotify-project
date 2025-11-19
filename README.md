# Projekti Spotify

Ky projekt, si pjesë e detyrës së kursit, synon ndërtimin e një aplikacioni të ngjashëm me Spotify me Next.js në frontend, Python në backend, PostgreSQL si bazë të dhënash, Supabase Auth për autentikim dhe Supabase Bucket për ruajtjen e skedarëve audio, duke demonstruar arkitekturë dhe praktika moderne zhvillimi.

## Struktura e Projektit

```
spotify-project/
├── frontend/          # Aplikacioni frontend (Next.js)
├── backend/           # Serveri backend (Python/FastAPI)
├── docs/              # Dokumentacioni dhe diagramet
└── README.md          # Dokumentacioni kryesor
```

## Fillimi

### Parakushtet

- Python 3.8+
- Node.js (versioni 14 ose më i ri)
- npm ose yarn
- Git

### Instalimi

1. Klononi repositorin:

```bash
git clone <repository-url>
cd spotify-project
```

2. Instaloni varësitë për frontend:

```bash
cd frontend
npm install
```

3. Instaloni varësitë për backend:

```bash
cd ../backend
pip install -r requirements.txt
```

### Ekzekutimi

1. Nisni serverin backend:

```bash
cd backend
uvicorn main:app --reload
```

2. Nisni aplikacionin frontend:

```bash
cd frontend
npm run dev
```

## Karakteristikat

- [ ] Autentifikimi i përdoruesit (Supabase Auth)
- [ ] Luajtja e muzikës
- [ ] Krijimi i playlist-eve
- [ ] Kërkimi i këngëve
- [ ] Profili i përdoruesit

## Teknologjitë e Përdorura

### Frontend

- Next.js 13+ (App Router)
- Chakra UI
- TypeScript
- Supabase JS Client (Auth & API)
- SWR për data fetching
- Framer Motion
- React Hook Form

### Backend

- Python 3.8+
- FastAPI
- PostgreSQL
- Supabase Python Client (Auth & Storage)
- Redis për cache
- SQLAlchemy ORM
- Alembic
- Pydantic

### Infrastrukturë & Shërbime

- Supabase (Auth, File Storage, API)
- PostgreSQL - Primary Database
- Redis - Caching & Sessions
- Docker - Containerization

## Kontributi

1. Fork projektin
2. Krijoni një branch të ri (`git checkout -b feature/karakteristika-e-re`)
3. Commit ndryshimet (`git commit -am 'Shtoj karakteristikë të re'`)
4. Push në branch (`git push origin feature/karakteristika-e-re`)
5. Krijoni një Pull Request

## Licenca

Ky projekt është i licensuar nën MIT License.

## Dokumentacioni

- [Arkitektura e Sistemit (Diagrama Kryesore)](backend/tests/docs/architecture.md)
- [Diagrami i Komponentëve & Flukset](backend/tests/docs/architecture.md#diagrami-i-komponentëve)
- [Rrjedha e Autentifikimit](backend/tests/docs/architecture.md#rrjedha-e-autentifikimit)
- [Arkitektura e Bazës së të Dhënave](backend/tests/docs/architecture.md#arkitektura-e-bazës-së-të-dhënave)

## Si të konfiguroni skedarin `.env` për backend

Për të ekzekutuar backend-in, duhet të krijoni një skedar `.env` brenda dosjes `backend/` me këto variabla. Shembullin e plotë e gjeni te `backend/.env`.

| Emri i Variablës                  | Përshkrimi                                                              |
| --------------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`                    | PostgreSQL connection string për bazën e të dhënave kryesore            |
| `REDIS_URL`                       | Redis connection URL për caching dhe sesione                            |
| `SUPABASE_URL`                    | URL e projektit tuaj Supabase                                           |
| `SUPABASE_ANON_KEY`               | Supabase public API key (përdoret për auth dhe operacione klienti)      |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service role key (admin access, mbajeni shumë të sigurtë!)     |
| `SUPABASE_BUCKET_NAME`            | Emri i bucket-it në Supabase për ruajtjen e këngëve                     |
| `JWT_SECRET_KEY`                  | Çelës sekret për nënshkrimin e JWT (mund të përdoret për tokens custom) |
| `JWT_ALGORITHM`                   | Algoritmi për nënshkrimin e JWT (zakonisht HS256)                       |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Sa minuta është valid një access token JWT                              |
| `APP_ENV`                         | Ambienti i aplikacionit (`development`, `production`, etj.)             |
| `DEBUG`                           | Aktivizon debug mode (`True` ose `False`)                               |
| `SECRET_KEY`                      | Çelës sekret për operacione të ndryshme kriptografike në aplikacion     |
| `LOG_LEVEL`                       | Niveli i logimit (`DEBUG`, `INFO`, `WARNING`, `ERROR`)                  |
| `SMTP_SERVER`                     | (Opsionale) SMTP server për dërgim email-esh                            |
| `SMTP_PORT`                       | (Opsionale) Porti SMTP                                                  |
| `SMTP_USERNAME`                   | (Opsionale) Email për autentikim SMTP                                   |
| `SMTP_PASSWORD`                   | (Opsionale) Fjalëkalimi për SMTP                                        |

**Shembull i shpejtë:**

```env
DATABASE_URL=postgresql://username:password@localhost:5432/spotify_db
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=songs
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_ENV=development
DEBUG=True
SECRET_KEY=your-app-secret-key
LOG_LEVEL=INFO
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

## Kontakti

Për pyetje ose sugjerime, kontaktoni në: [email@example.com]

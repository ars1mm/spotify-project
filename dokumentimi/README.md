# Dokumentimi Teknik i Projektit Spotify

Mirë se vini në dokumentimin teknik të projektit Spotify. Ky dokumentim ofron një pasqyrë të plotë të arkitekturës, implementimit dhe aspekteve teknike të projektit.

## Struktura e Dokumentimit

```
dokumentimi/
├── README.md                          # Kjo faqe - Hyrje në dokumentim
├── 01-arkitektura-e-sistemit.md      # Arkitektura e përgjithshme e sistemit
├── 02-frontend-implementimi.md       # Detaje teknike të frontend-it
├── 03-backend-implementimi.md        # Detaje teknike të backend-it
├── 04-baza-e-te-dhenave.md          # Skema dhe struktura e bazës së të dhënave
├── 05-autentifikimi.md              # Sistemi i autentifikimit dhe autorizimit
├── 06-menaxhimi-i-skedareve.md      # Upload dhe storage i këngëve
├── 07-api-dokumentimi.md            # Dokumentimi i API endpoints
└── 08-deployment.md                 # Udhëzime për deployment
```

## Përmbledhje e Projektit

Ky projekt është një aplikacion web i ngjashëm me Spotify që lejon përdoruesit të:
- Regjistrohen dhe autentikohen në sistem
- Ngarkojnë dhe menaxhojnë këngë
- Krijojnë dhe menaxhojnë playlist-e
- Kërkojnë dhe luajnë muzikë
- Shikojnë profile të personalizuara

## Stack Teknologjik

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **UI Library**: Chakra UI
- **Gjuha**: TypeScript
- **State Management**: React Hooks & Context API
- **Data Fetching**: SWR
- **Animacione**: Framer Motion
- **Form Handling**: React Hook Form

### Backend
- **Framework**: FastAPI (Python)
- **Baza e të Dhënave**: PostgreSQL
- **Cache**: Redis
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Validation**: Pydantic

### Infrastrukturë
- **Autentifikimi**: Supabase Auth
- **File Storage**: Supabase Storage
- **Containerization**: Docker
- **Database**: PostgreSQL (Supabase)

## Si të Lexoni Këtë Dokumentim

1. **Filloni me Arkitekturën** - Lexoni `01-arkitektura-e-sistemit.md` për të kuptuar strukturën e përgjithshme
2. **Eksploroni Frontend-in** - Shikoni `02-frontend-implementimi.md` për detaje të UI/UX
3. **Kuptoni Backend-in** - Lexoni `03-backend-implementimi.md` për logjikën e serverit
4. **Studioni Bazën e të Dhënave** - Shikoni `04-baza-e-te-dhenave.md` për skemën
5. **Mësoni për Autentifikimin** - Lexoni `05-autentifikimi.md` për security
6. **Eksploroni API-në** - Përdorni `07-api-dokumentimi.md` si referencë

## Kontributi në Dokumentim

Ky dokumentim është një dokument i gjallë dhe duhet të përditësohet me çdo ndryshim të rëndësishëm në kod. Nëse shtoni funksionalitete të reja ose ndryshoni arkitekturën, ju lutemi përditësoni dokumentimin përkatës.

## Kontakti

Për pyetje ose sugjerime rreth dokumentimit, kontaktoni ekipin e zhvillimit.

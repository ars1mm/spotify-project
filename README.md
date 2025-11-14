# Projekti Spotify

Ky është një projekt për të ndërtuar një aplikacion të ngjashëm me Spotify.

## Struktura e Projektit

```
spotify-project/
├── frontend/          # Aplikacioni frontend (React)
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
npm start
```

## Karakteristikat

- [ ] Autentifikimi i përdoruesit
- [ ] Luajtja e muzikës
- [ ] Krijimi i playlist-eve
- [ ] Kërkimi i këngëve
- [ ] Profili i përdoruesit

## Teknologjitë e Përdorura

### Frontend
- React.js
- CSS/SCSS
- Axios për API calls

### Backend
- Python 3.8+
- FastAPI
- PostgreSQL
- Auth0 për autentifikim
- Redis për cache
- SQLAlchemy ORM

### Shërbimet e Jashtme
- Auth0 - Autentifikimi dhe autorizimi
- Spotify Web API - Metadata e muzikës
- AWS S3 - Ruajtja e skedarëve audio
- Redis Cloud - Cache dhe session management

## Kontributi

1. Fork projektin
2. Krijoni një branch të ri (`git checkout -b feature/karakteristika-e-re`)
3. Commit ndryshimet (`git commit -am 'Shtoj karakteristikë të re'`)
4. Push në branch (`git push origin feature/karakteristika-e-re`)
5. Krijoni një Pull Request

## Licenca

Ky projekt është i licensuar nën MIT License.

## Dokumentacioni

- [Arkitektura e Sistemit](docs/architecture.md) - Diagramet dhe detajet teknike

## Kontakti

Për pyetje ose sugjerime, kontaktoni në: [email@example.com]
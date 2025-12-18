# Arkitektura e Sistemit

## Përmbledhje

Projekti Spotify përdor një arkitekturë të ndarë në tre shtresa (three-tier architecture):
1. **Frontend (Presentation Layer)** - Next.js aplikacion
2. **Backend (Application Layer)** - FastAPI server
3. **Data Layer** - PostgreSQL + Redis + Supabase Storage

## Diagrami i Arkitekturës

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (Browser/Mobile)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js Application (Port 3000)             │  │
│  │                                                       │  │
│  │  • React Components (Chakra UI)                      │  │
│  │  • Context API (State Management)                    │  │
│  │  • Client-side Routing                               │  │
│  │  • API Client (fetch/axios)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FastAPI Server (Port 8000)                    │  │
│  │                                                       │  │
│  │  • API Routes & Endpoints                            │  │
│  │  • Business Logic                                    │  │
│  │  • Authentication Middleware                         │  │
│  │  • Data Validation (Pydantic)                        │  │
│  │  • File Upload Handler                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬──────────────────┬─────────────────────────────┘
             │                  │
             │                  │
    ┌────────▼────────┐  ┌─────▼──────────┐
    │                 │  │                 │
    │  PostgreSQL     │  │  Redis Cache    │
    │  (Port 5432)    │  │  (Port 6379)    │
    │                 │  │                 │
    │  • Users        │  │  • Sessions     │
    │  • Songs        │  │  • Temp Data    │
    │  • Playlists    │  │                 │
    └─────────────────┘  └─────────────────┘
             │
             │
    ┌────────▼────────────────────┐
    │                             │
    │   Supabase Services         │
    │                             │
    │  • Auth (JWT)               │
    │  • Storage (Audio Files)    │
    │  • Storage (Cover Images)   │
    └─────────────────────────────┘
```

## Komponentët Kryesorë

### 1. Frontend (Next.js)

**Lokacioni**: `/frontend`

**Përgjegjësitë**:
- Rendering i UI/UX
- Menaxhimi i state-it të aplikacionit
- Komunikimi me backend përmes REST API
- Autentifikimi i përdoruesit (token management)
- Audio player functionality

**Teknologjitë**:
- Next.js 13+ me App Router
- TypeScript për type safety
- Chakra UI për komponente UI
- Context API për global state
- React Hooks për local state

### 2. Backend (FastAPI)

**Lokacioni**: `/backend`

**Përgjegjësitë**:
- Ekspozimi i REST API endpoints
- Validimi i të dhënave
- Business logic
- Autentifikimi dhe autorizimi
- Komunikimi me bazën e të dhënave
- File upload dhe processing
- Integrimi me Supabase

**Teknologjitë**:
- FastAPI për API framework
- SQLAlchemy për ORM
- Alembic për database migrations
- Pydantic për data validation
- JWT për token-based auth

### 3. Data Layer

#### PostgreSQL
**Përgjegjësitë**:
- Ruajtja e të dhënave strukturore
- Relational data (users, songs, playlists)
- ACID transactions

#### Redis
**Përgjegjësitë**:
- Caching i të dhënave të përdorura shpesh
- Session management
- Rate limiting

#### Supabase Storage
**Përgjegjësitë**:
- Ruajtja e skedarëve audio
- Ruajtja e imazheve të cover-it
- CDN për shpërndarje të shpejtë

## Rrjedha e të Dhënave

### 1. Autentifikimi
```
User → Frontend → Backend → Supabase Auth → JWT Token → Frontend
```

### 2. Upload i Këngës
```
User → Frontend → Backend → Validation → Supabase Storage → PostgreSQL (metadata)
```

### 3. Luajtja e Këngës
```
User → Frontend → Backend → PostgreSQL (metadata) → Supabase Storage (audio URL) → Frontend Player
```

### 4. Kërkimi
```
User → Frontend → Backend → PostgreSQL (query) → Redis (cache) → Frontend (results)
```

## Modelet e Komunikimit

### Frontend ↔ Backend
- **Protokolli**: HTTP/HTTPS
- **Formati**: JSON
- **Autentifikimi**: Bearer Token (JWT)
- **Endpoints**: RESTful API

### Backend ↔ Database
- **PostgreSQL**: SQLAlchemy ORM
- **Redis**: Redis client library
- **Connection Pooling**: Për performance

### Backend ↔ Supabase
- **Auth**: Supabase Python Client
- **Storage**: Supabase Storage API
- **Autentifikimi**: Service Role Key

## Siguria

### Niveli i Frontend-it
- Token storage në localStorage/sessionStorage
- HTTPS për të gjitha kërkesat
- Input validation
- XSS protection

### Niveli i Backend-it
- JWT verification
- Rate limiting
- CORS configuration
- SQL injection prevention (ORM)
- File upload validation

### Niveli i të Dhënave
- Encrypted connections
- Role-based access control
- Backup strategy
- Data encryption at rest

## Skalabilitet

### Horizontal Scaling
- Frontend: Multiple Next.js instances
- Backend: Multiple FastAPI workers
- Database: Read replicas

### Vertical Scaling
- Increase server resources
- Optimize queries
- Implement caching

### Performance Optimization
- Redis caching
- Database indexing
- CDN për static assets
- Lazy loading
- Code splitting

## Monitorimi dhe Logging

### Frontend
- Error tracking
- Performance monitoring
- User analytics

### Backend
- API request logging
- Error logging
- Performance metrics
- Database query monitoring

### Infrastructure
- Server health checks
- Resource utilization
- Uptime monitoring

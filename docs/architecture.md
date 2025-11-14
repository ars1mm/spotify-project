# Arkitektura e Sistemit

## Përmbledhje e Arkitekturës

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Next.js App] --> B[Auth0 Next.js SDK]
        A --> C[SWR Client]
        A --> D[Chakra UI Components]
        E[API Routes] --> F[Server Actions]
    end
    
    subgraph "Authentication"
        G[Auth0] --> H[JWT Tokens]
    end
    
    subgraph "Backend Services"
        I[FastAPI Server] --> J[PostgreSQL]
        I --> K[Redis Cache]
        I --> L[Spotify API]
    end
    
    subgraph "Storage"
        M[AWS S3] --> N[Audio Files]
        M --> O[Cover Images]
    end
    
    B --> G
    C --> I
    E --> I
    I --> M
    
    style A fill:#000000
    style I fill:#009688
    style G fill:#eb5424
    style J fill:#336791
    style K fill:#dc382d
    style D fill:#319795
```

## Diagrami i Komponentëve

```mermaid
graph LR
    subgraph "Frontend Layer"
        A[Next.js Pages]
        B[Chakra UI Components]
        C[SWR Hooks]
        D[Auth0 Provider]
    end
    
    subgraph "API Layer"
        E[Next.js API Routes]
        F[FastAPI Router]
        G[Middleware]
        H[Auth Validation]
    end
    
    subgraph "Business Logic"
        I[User Service]
        J[Music Service]
        K[Playlist Service]
        L[Search Service]
    end
    
    subgraph "Data Layer"
        M[(PostgreSQL)]
        N[(Redis)]
        O[Spotify API]
        P[AWS S3]
    end
    
    A --> B
    A --> C
    A --> D
    C --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    
    I --> M
    J --> M
    K --> M
    L --> N
    J --> O
    J --> P
```

## Rrjedha e Autentifikimit

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth0
    participant B as Backend
    participant D as Database
    
    U->>F: Login Request
    F->>A: Redirect to Auth0
    A->>U: Login Form
    U->>A: Credentials
    A->>F: JWT Token
    F->>B: API Request + JWT
    B->>A: Validate Token
    A->>B: Token Valid
    B->>D: Query Data
    D->>B: Return Data
    B->>F: API Response
    F->>U: Display Content
```

## Arkitektura e Bazës së të Dhënave

```mermaid
erDiagram
    USERS {
        uuid id PK
        string auth0_id UK
        string email
        string username
        string display_name
        timestamp created_at
        timestamp updated_at
    }
    
    PLAYLISTS {
        uuid id PK
        uuid user_id FK
        string name
        text description
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    SONGS {
        uuid id PK
        string spotify_id UK
        string title
        string artist
        string album
        integer duration_ms
        string preview_url
        string image_url
    }
    
    PLAYLIST_SONGS {
        uuid playlist_id FK
        uuid song_id FK
        integer position
        timestamp added_at
    }
    
    USER_FAVORITES {
        uuid user_id FK
        uuid song_id FK
        timestamp created_at
    }
    
    USERS ||--o{ PLAYLISTS : creates
    PLAYLISTS ||--o{ PLAYLIST_SONGS : contains
    SONGS ||--o{ PLAYLIST_SONGS : included_in
    USERS ||--o{ USER_FAVORITES : likes
    SONGS ||--o{ USER_FAVORITES : liked_by
```

## Teknologjitë e Përdorura

### Frontend Stack
- **Next.js 13+** - React Framework (App Router)
- **TypeScript** - Type Safety
- **Chakra UI** - Component Library
- **Auth0 Next.js SDK** - Authentication
- **SWR** - Data Fetching & Caching
- **Framer Motion** - Animations
- **React Hook Form** - Form Management

### Backend Stack
- **Python 3.8+** - Programming Language
- **FastAPI** - Web Framework
- **SQLAlchemy** - ORM
- **Alembic** - Database Migrations
- **Pydantic** - Data Validation
- **python-jose** - JWT Handling

### Infrastructure
- **PostgreSQL** - Primary Database
- **Redis** - Caching & Sessions
- **AWS S3** - File Storage
- **Auth0** - Authentication Service
- **Spotify Web API** - Music Metadata

### Development Tools
- **Docker** - Containerization
- **pytest** - Testing Framework
- **Black** - Code Formatting
- **Flake8** - Linting
- **pre-commit** - Git Hooks
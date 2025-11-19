# Arkitektura e Sistemit

## Përmbledhje e Arkitekturës

```mermaid
%%{init: { 'theme': 'dark', 'themeVariables': { 'background': '#000000' } } }%%
graph TB
    subgraph "Frontend (Next.js)"
        A[Next.js App] --> B[Supabase Auth Client]
        A --> C[SWR Client]
        A --> D[Chakra UI Components]
        E[API Routes] --> F[Server Actions]
    end

    subgraph "Authentication"
        G[Supabase Auth] --> H[JWT Tokens]
    end

    subgraph "Backend Services"
        I[FastAPI Server] --> J[PostgreSQL]
        I --> K[Redis Cache]
    end

    subgraph "Storage"
        M[Supabase S3 Bucket] --> N[Audio Files]
        M --> O[Cover Images]
    end

    B --> G
    C --> I
    E --> I
    I --> M

    style A fill:#000000
    style I fill:#009688
    style G fill:#3ECF8E
    style J fill:#336791
    style K fill:#dc382d
    style D fill:#319795
```

## Diagrami i Komponentëve

```mermaid
%%{init: { 'theme': 'dark', 'themeVariables': { 'background': '#000000' } } }%%
graph LR
    subgraph "Frontend Layer"
        A[Next.js Pages]
        B[Chakra UI Components]
        C[SWR Hooks]
        D[Supabase Auth Client]
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
        P[Supabase S3 Bucket]
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
    J --> P
```

## Rrjedha e Autentifikimit

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Auth
    participant B as Backend
    participant D as Database

    U->>F: Login/Register Request
    F->>S: Supabase Auth API
    S->>U: Auth Response (JWT)
    F->>B: API Request + JWT
    B->>S: Validate Token
    S->>B: Token Valid
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
        string supabase_id UK
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
        string title
        string artist
        string album
        integer duration_ms
        string audio_url
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
- **Supabase JS Client** - Authentication & API
- **SWR** - Data Fetching & Caching
- **Framer Motion** - Animations
- **React Hook Form** - Form Management

### Backend Stack

- **Python 3.8+** - Programming Language
- **FastAPI** - Web Framework
- **SQLAlchemy** - ORM
- **Alembic** - Database Migrations
- **Pydantic** - Data Validation
- **Supabase Python Client** - Auth & Storage

### Infrastructure

- **PostgreSQL** - Primary Database
- **Redis** - Caching & Sessions
- **Supabase** - Auth, File Storage (S3 Bucket), and API

### Development Tools

- **Docker** - Containerization
- **pytest** - Testing Framework
- **Black** - Code Formatting
- **Flake8** - Linting
- **pre-commit** - Git Hooks

# Arkitektura e Sistemit

## Përmbledhje e Arkitekturës

```mermaid
graph TB
    subgraph "Frontend"
        A[React App] --> B[Auth0 SDK]
        A --> C[API Client]
    end
    
    subgraph "Authentication"
        D[Auth0] --> E[JWT Tokens]
    end
    
    subgraph "Backend Services"
        F[FastAPI Server] --> G[PostgreSQL]
        F --> H[Redis Cache]
        F --> I[Spotify API]
    end
    
    subgraph "Storage"
        J[AWS S3] --> K[Audio Files]
        J --> L[Cover Images]
    end
    
    B --> D
    C --> F
    F --> J
    
    style A fill:#61dafb
    style F fill:#009688
    style D fill:#eb5424
    style G fill:#336791
    style H fill:#dc382d
```

## Diagrami i Komponentëve

```mermaid
graph LR
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
    end
    
    subgraph "API Gateway"
        C[FastAPI Router]
        D[Middleware]
        E[Auth Validation]
    end
    
    subgraph "Business Logic"
        F[User Service]
        G[Music Service]
        H[Playlist Service]
        I[Search Service]
    end
    
    subgraph "Data Layer"
        J[(PostgreSQL)]
        K[(Redis)]
        L[Spotify API]
        M[AWS S3]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    
    F --> J
    G --> J
    H --> J
    I --> K
    G --> L
    G --> M
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
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Auth0 React SDK** - Authentication
- **React Query** - State Management & Caching
- **React Router** - Navigation

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
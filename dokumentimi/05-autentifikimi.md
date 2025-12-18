# Autentifikimi dhe Autorizimi

## Përmbledhje

Sistemi i autentifikimit përdor një kombinim të Supabase Auth për menaxhimin e përdoruesve dhe JWT (JSON Web Tokens) për session management. Kjo qasje ofron siguri të lartë dhe skalabilitet të mirë.

## Arkitektura e Autentifikimit

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ 1. Login Request (email/password)
       ▼
┌──────────────────┐
│  Frontend (Next) │
└──────┬───────────┘
       │
       │ 2. POST /api/v1/auth/login
       ▼
┌──────────────────┐
│  Backend (API)   │
│                  │
│  • Validate      │
│  • Hash check    │
└──────┬───────────┘
       │
       │ 3. Verify credentials
       ▼
┌──────────────────┐
│  Supabase Auth   │
│                  │
│  • User lookup   │
│  • Password ver. │
└──────┬───────────┘
       │
       │ 4. Generate JWT
       ▼
┌──────────────────┐
│  Backend (API)   │
│                  │
│  • Create token  │
│  • Set expiry    │
└──────┬───────────┘
       │
       │ 5. Return token + user data
       ▼
┌──────────────────┐
│  Frontend (Next) │
│                  │
│  • Store token   │
│  • Update state  │
└──────────────────┘
```

## Rrjedha e Regjistrimit

### 1. User Registration

**Frontend Request**:
```typescript
const register = async (data: RegisterData) => {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name
    })
  })
  
  if (!response.ok) {
    throw new Error('Registration failed')
  }
  
  return response.json()
}
```

**Backend Handler**:
```python
@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user exists
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user in database
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Optional: Create user in Supabase Auth
    try:
        supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name
                }
            }
        })
    except Exception as e:
        logger.error(f"Supabase signup failed: {e}")
    
    return new_user
```

**Validimi**:
- Email format validation
- Password strength (minimum 8 characters)
- Name presence check
- Duplicate email check

## Rrjedha e Login-it

### 1. User Login

**Frontend Request**:
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    throw new Error('Invalid credentials')
  }
  
  const data = await response.json()
  
  // Store token
  authStorage.setToken(data.access_token)
  authStorage.setSession({
    user: data.user,
    token: data.access_token
  })
  
  return data
}
```

**Backend Handler**:
```python
@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginCredentials,
    db: Session = Depends(get_db)
):
    # Find user
    user = db.query(User).filter(
        User.email == credentials.email
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
```

## JWT Token Management

### Token Structure

```json
{
  "sub": "user-uuid-here",
  "exp": 1704067200,
  "iat": 1704063600,
  "type": "access"
}
```

**Claims**:
- `sub`: Subject (User ID)
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp
- `type`: Token type (access/refresh)

### Token Creation

```python
from datetime import datetime, timedelta
import jwt

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt
```

### Token Verification

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
```

## Frontend Token Storage

### Auth Storage Utility

```typescript
// lib/auth.ts
export const authStorage = {
  setToken(token: string) {
    localStorage.setItem('access_token', token)
  },
  
  getToken(): string | null {
    return localStorage.getItem('access_token')
  },
  
  removeToken() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_session')
  },
  
  setSession(session: { user: User; token: string }) {
    localStorage.setItem('user_session', JSON.stringify(session))
    this.setToken(session.token)
  },
  
  getSession(): { user: User; token: string } | null {
    const session = localStorage.getItem('user_session')
    return session ? JSON.parse(session) : null
  },
  
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }
}
```

## Protected Routes

### Backend Protection

```python
# Protect endpoint with authentication
@router.get("/songs", response_model=List[SongResponse])
async def get_songs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    songs = db.query(Song).all()
    return songs

# Optional authentication
@router.get("/songs/public", response_model=List[SongResponse])
async def get_public_songs(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    # current_user will be None if not authenticated
    songs = db.query(Song).filter(Song.is_public == True).all()
    return songs
```

### Frontend Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  
  // Protected routes
  const protectedPaths = ['/playlist', '/upload', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/playlist/:path*', '/upload/:path*', '/profile/:path*']
}
```

## Password Security

### Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

**Karakteristikat**:
- Bcrypt algorithm (industry standard)
- Automatic salt generation
- Configurable work factor
- Resistant to rainbow table attacks

### Password Requirements

```python
import re

def validate_password(password: str) -> bool:
    """
    Validate password strength:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return False
    
    if not re.search(r'[A-Z]', password):
        return False
    
    if not re.search(r'[a-z]', password):
        return False
    
    if not re.search(r'\d', password):
        return False
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True
```

## Session Management

### Token Refresh

```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Generate a new access token"""
    new_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "user": current_user
    }
```

### Logout

```python
@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout user (client-side token removal)
    For server-side invalidation, implement token blacklist
    """
    # Optional: Add token to blacklist in Redis
    # redis_client.setex(f"blacklist:{token}", 3600, "1")
    
    return {"message": "Successfully logged out"}
```

**Frontend Logout**:
```typescript
const logout = () => {
  authStorage.removeToken()
  router.push('/login')
}
```

## Role-Based Access Control (RBAC)

### User Roles

```python
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

# Add to User model
class User(Base):
    # ... other fields
    role = Column(Enum(UserRole), default=UserRole.USER)
```

### Permission Checking

```python
def require_role(required_role: UserRole):
    """Dependency to check user role"""
    async def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    
    return role_checker

# Usage
@router.delete("/songs/{song_id}")
async def delete_song(
    song_id: UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    # Only admins can delete songs
    pass
```

## Security Best Practices

### 1. HTTPS Only
```python
# Force HTTPS in production
if settings.APP_ENV == "production":
    app.add_middleware(
        HTTPSRedirectMiddleware
    )
```

### 2. CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    # Max 5 login attempts per minute
    pass
```

### 4. Token Expiration
```python
# Short-lived access tokens
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Long-lived refresh tokens
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7
```

### 5. Secure Headers
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.sessions import SessionMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com"])
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
```

## Error Handling

### Authentication Errors

```python
class AuthenticationError(Exception):
    """Base authentication error"""
    pass

class InvalidCredentialsError(AuthenticationError):
    """Invalid email or password"""
    pass

class TokenExpiredError(AuthenticationError):
    """JWT token has expired"""
    pass

class InsufficientPermissionsError(AuthenticationError):
    """User lacks required permissions"""
    pass

# Error handlers
@app.exception_handler(AuthenticationError)
async def auth_exception_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)}
    )
```

## Testing Authentication

### Unit Tests

```python
def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )
    assert response.status_code == 201
    assert "id" in response.json()

def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.get("/api/v1/songs")
    assert response.status_code == 401

def test_protected_route_with_token(client, test_token):
    response = client.get(
        "/api/v1/songs",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
```

## Monitoring dhe Logging

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/login")
async def login(...):
    logger.info(f"Login attempt for email: {credentials.email}")
    
    try:
        # ... authentication logic
        logger.info(f"Successful login for user: {user.id}")
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise
```

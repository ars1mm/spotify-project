# Orkestrimi me Docker Compose

## Përmbledhje

Për zhvillimin lokal, ne përdorim **Docker Compose** për të ngritur të gjithë infrastrukturën me një komandë të vetme. Kjo përfshin Backend-in dhe shërbimin Redis për caching dhe rate limiting.

## Struktura e `docker-compose.yml`

Skedari ndodhet në rrënjën (root) e projektit dhe definon shërbimet e mëposhtme:

### 1. Shërbimi Redis
```yaml
redis:
  image: redis:7-alpine
  container_name: spotify-redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

### 2. Shërbimi Backend
```yaml
backend:
  build: ./backend
  container_name: spotify-backend
  ports:
    - "8000:8000"
  environment:
    - REDIS_URL=redis://redis:6379
  depends_on:
    - redis
```

## Komandat e Përdorimit

### Nisja e Shërbimeve
Për të nisur aplikacionin në prapavijë:
```bash
docker-compose up -d
```

### Rindërtimi (Rebuild)
Nëse shtohen varësi të reja në `requirements.txt`:
```bash
docker-compose up --build
```

### Ndalimi i Shërbimeve
```bash
docker-compose down
```

## Zhvillimi me Hot-Reload
Për të lejuar ndryshimet e kodit në kohë reale brenda kontejnerit gjatë zhvillimit, ne kalojmë kodin si `volume`:
```yaml
volumes:
  - ./backend:/app
```
*Shënim: Në produksion, kodi duhet të jetë i "pjekur" (baked) brenda imazhit për siguri dhe performancë.*

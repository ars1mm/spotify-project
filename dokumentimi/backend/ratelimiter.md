# Rate Limiter (Mbyllja e kërkesave) - Dokumentim

Ky dokument përshkruan implementimin e rate limiter-it në backend (`backend/app/core/rate_limiter.py`) dhe si ta konfiguroni dhe përdorni atë.

## Përmbledhje

Backend përdor paketën `slowapi` (një wrapper për `limits`) për të zbatuar rate limiting në endpoint-et e FastAPI. Implementimi tenton të përdorë Redis si storage për counter-at; në mungesë të Redis ose në rast gabimi, bën fallback në storage memorie (`memory://`).

## Sjellja kryesore

- Leverage: `Limiter` nga `slowapi`.
- `key_func`: `get_remote_address` — çelësi bazë është adresa e klientit (IP).
- `storage_uri`: përdor `REDIS_URL` nëse është i konfiguruar dhe i arritshëm; ndryshe përdor `memory://`.
- `default_limits`: `60/30seconds` — default: 60 kërkesa çdo 30 sekonda.

## File dhe pjesët kyçe

- `redis_url = os.getenv("REDIS_URL")` — nëse ekziston dhe nuk është localhost, skripta provon të lidhet dhe `ping()`.
- Në rast dështimi të lidhjes me Redis, skripta print-on gabimin dhe përdor `memory://`.
- Objekt: `limiter = Limiter(...)` — ky objekt përdoret më pas në aplikacionin FastAPI (p.sh. si middleware ose decorators në router).

## Si ta përdorni në `FastAPI`

1. Importoni `limiter` dhe shtoni exception handler:

```python
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import FastAPI
from backend.app.core.rate_limiter import limiter

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
```

2. Përdorni decorator për rregulla specifike në endpoint-e:

```python
from slowapi.util import get_remote_address
from backend.app.core.rate_limiter import limiter

@router.get('/search')
@limiter.limit('10/minute')
async def search(request: Request, q: str):
    # request është i nevojshëm për slowapi
    return {"q": q}
```

3. Ose mbështetni default limits pa dekorator, duke u nisur nga `default_limits` në konfigurim.

## Konfigurimi dhe rekomandime

- `REDIS_URL`: në production rekomandohet të vendosni `REDIS_URL` për të përdorur storage të centralizuar (shumë instance do të ndajnë counters).
- Mos përdorni memory storage në multi-instance production sepse çdo instance do të ketë counters të pavarur.
- Adjust `default_limits` sipas nevojave: p.sh. `100/minute` ose `200/5minutes`.
- Kombinoni me authentication-based keys nëse dëshironi limitim per-user; shtoni `key_func` që lexon user id nga tokeni.

## Trajtimi i gabimeve

- `slowapi` hedh `RateLimitExceeded` — e trajtoni me `_rate_limit_exceeded_handler` ose me handler tuaj për të kthyer mesazh të qartë (HTTP 429).

## Testim

- Lokal: pa Redis, do të përdoret memory store. Testoni duke dërguar shumë kërkesa dhe verifikoni që pas pragut merrni `429 Too Many Requests`.
- Me Redis: sigurohuni që `REDIS_URL` është korrekt dhe që container/instance mund të ping-ojë Redis.

## Shembull `docker-compose` për Redis

```yaml
services:
  redis:
    image: redis:7
    ports:
      - '6379:6379'

  backend:
    build: ./backend
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
```

## Përmbledhje

Rate limiter-i aktual është i thjeshtë për t'u përdorur dhe fleksibël: përdor Redis kur është i disponueshëm dhe memory fallback për development. Për production, konfiguro Redis dhe përshtatni limits sipas nevojave.

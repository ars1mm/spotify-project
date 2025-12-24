# Rate Limiter (Kufizimi i Kërkesave)

Për të mbrojtur serverin nga mbingarkesa dhe abuzimet, sistemi përdor një mekanizëm për kufizimin e kërkesave (Rate Limiting).

## Implementimi

Sistemi përdor paketën `slowapi`, e cila bazohet në librarinë `limits`.
-   **Storage**: Përdoret **Redis** nëse është i konfiguruar, përndryshe mbetet në **Memory Storage**.
-   **Identifikimi**: Kufizimi bëhet në bazë të adresës IP të klientit.

## Rregullat Default

-   **Limiti i Përgjithshëm**: 60 kërkesa çdo 30 sekonda për çdo IP.
-   **Gabimi 429**: Nëse tejkalohet limiti, përdoruesi merr mesazhin `429 Too Many Requests`.

## Aplikimi në Endpoints

Mund të vendosen limite specifike për funksione të ndryshme:

```python
@router.get("/search")
@limiter.limit("20/minute")
async def search_songs(request: Request, q: str):
    return supabase_service.search(q)
```

## Konfigurimi i Mjedisit

Për rezultate optimale në production, duhet të konfigurohet variabla e mjedisit:
-   `REDIS_URL`: URL-ja e serverit Redis (p.sh. `redis://localhost:6379/0`).

Pa Redis, llogaritja e kërkesave bëhet veçmas për çdo instance të serverit, gjë që mund të mos jetë e saktë në sisteme me shumë serverë.

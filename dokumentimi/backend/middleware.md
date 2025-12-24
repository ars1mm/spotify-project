(The middleware implementation file is: `backend/app/middleware/admin_auth.py`)

# Middleware: Admin Auth (Përshkrim)

Ky modul ofron një mënyrë të thjeshtë dhe të lehtë për të mbrojtur endpoint-et administrative duke përdorur një *admin key* të gjeneruar automatikisht dhe një dependency FastAPI (HTTP Bearer).

Pikat kryesore:

- Key-i admin gjenerohet si një SHA-256 hash i bytes të rastësishëm.
- Key rotacionohet automatikisht pas një periudhe të konfiguruar (`ADMIN_KEY_ROTATION_SECONDS`, default 3600s = 1h).
- Verifikimi përdor `hmac.compare_digest` për krahasim në kohë konstante (mbrojtje kundër timing attacks).
- Dependency `verify_admin_token` përdoret në router për të detyruar pranimin e header-it `Authorization: Bearer <token>`.

## Funksionet kryesore

- `get_admin_key()` — kthen key-in aktual; nëse nuk ekziston ose ka skaduar, gjeneron dhe rotacionon një key të ri.
- `rotate_admin_key()` — detyron rotacion manual, kthen key-in e ri dhe shkruan në stdout info mbi rotacionin (key + expiry).
- `get_key_expiry_info()` — jep informacion për kohën e mbetur deri në rotacion.
- `verify_admin_key(provided_key: str) -> bool` — krahason key-in e dhënë me key-in aktual me krahasim konstant.
- `verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security))` — dependency FastAPI që heq token nga header dhe hedh `HTTPException(401)` nëse token mungon ose është i pavlefshëm.

## Si ta përdorni

Në router-in ose endpoint-in ku do të kërkohet akses admin, përdorni dependency-n:

```python
from fastapi import APIRouter, Depends
from backend.app.middleware.admin_auth import verify_admin_token

router = APIRouter()

@router.delete('/admin/songs/{song_id}')
async def delete_song(song_id: str, ok: bool = Depends(verify_admin_token)):
	# Nëse verify_admin_token nuk hedh exception, kërkesa lejohet
	return {"deleted": song_id}
```

Kërkesa duhet të përmbajë header-in:

```
Authorization: Bearer <ADMIN_KEY>
```

Shembull curl:

```bash
curl -X DELETE -H "Authorization: Bearer $ADMIN_KEY" http://localhost:8000/admin/songs/abcd-1234
```

## Konfigurimi

- Variabla mjedisi: `ADMIN_KEY_ROTATION_SECONDS` — përcakton intervalin në sekonda për rotacionin e key-it (default 3600).
- File: `backend/app/middleware/admin_auth.py` përmban implementimin.

## Siguria dhe kufizimet

- Key-i ruhet vetëm në memorien e procesit aktual. Nëse aplikacioni drejtohet me shumë worker (p.sh. uvicorn -w N), çdo proces do të ketë key të ndryshëm: kjo do të bëjë që tokeni i printuar nga një proces të mos punojë me një tjetër.
- Printimi i key-it në stdout (`rotate_admin_key()` e printon key-in) është i përshtatshëm për ambiente development/testing, por është i pasigurt për production — rekomandohet të përdorni një kanal më të sigurt për shpërndarje (p.sh. secrets manager, CLI i brendshëm ose panel admin).
- Përdorimi i një admin key të vetëm nuk përfaqëson RBAC të sofistikuar. Për production preferohet përdorimi i role-based JWT ose sistemi i autorizimit të Supabase.
- Sigurohuni që të përdorni HTTPS dhe rate limiting për endpoint-et admin.

## Rekomandime për përmirësim

- Nëse keni shumë instance/process: ruani key-in në Redis ose në një secrets store dhe përdorni atë për verifikim të centralizuar.
- Zëvendësoni printimin e key-it me një metodë të sigurt për shpërndarjen e sekretit (p.sh. integrim me Vault ose e-mail me expiration).
- Shtoni një blacklist për tokena të revokuar, ose përdorni JWT me claims të kohëzgjatjes dhe revokim.

## Testimi

- Për testim lokal, merrni key-in duke thirrur `rotate_admin_key()` në REPL ose duke bërë një request që shkakton gjenerimin (p.sh. thirrja e `get_key_expiry_info()` nga një route admin diagnostic).
- Pasi të keni key-in, përdorni `curl` ose Postman për të verifikuar aksesin ndaj endpoint-eve të mbrojtura.

## Përmbledhje

Ky middleware është një zgjidhje e thjeshtë për raste kur duhen endpoint-e administrative të aksesueshme shpejt pa ndërtuar sistem të plotë të rolave. Përdoreni me kujdes në production dhe konsideroni përmirësimet e sigurisë të përshkruara më sipër.


# Middleware: Autentifikimi Admin

Ky modul ofron një mënyrë të thjeshtë për të mbrojtur pikat e hyrjes (endpoints) administrative duke përdorur një çelës administrimi (_admin key_) të gjeneruar automatikisht.

## Funksionaliteti

-   **Gjenerimi i Çelësit**: Çelësi admin gjenerohet si një hash SHA-256 i biteve të rastësishëm.
-   **Rotacioni Automatik**: Çelësi ndryshon automatikisht pas një periudhe të caktuar (default: 1 orë).
-   **Mbrojtja nga Timing Attacks**: Përdoret `hmac.compare_digest` për krahasim në kohë konstante.

## Përdorimi në Kod

Për të mbrojtur një rrugë, përdoret dependency `verify_admin_token`:

```python
from fastapi import APIRouter, Depends
from app.middleware.admin_auth import verify_admin_token

router = APIRouter()

@router.delete('/admin/songs/{song_id}')
async def delete_song(song_id: str, ok: bool = Depends(verify_admin_token)):
    # Vetëm adminët mund ta ekzekutojnë këtë
    return {"status": "deleted"}
```

## Konfigurimi

-   `ADMIN_KEY_ROTATION_SECONDS`: Përcakton sa shpesh ndryshon çelësi (default: 3600 sekonda).

## Siguria në Production

-   Në ambientet production, rekomandohet integrimi me një sistem më të avancuar si **Vault** ose **Supabase Roles**.
-   Çelësi aktual ruhet në memorien e procesit, që do të thotë se nëse keni shumë worker-ë, secili do të ketë një çelës të ndryshëm.

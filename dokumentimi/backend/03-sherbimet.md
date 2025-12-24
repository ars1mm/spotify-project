# Shërbimet e Sistemit (Services)

Logjika kryesore e aplikacionit është e ndarë në shërbime (services) asinkrone, të cilat mundësojnë një kod të pastër dhe të testueshëm.

## Supabase Service (`supabase_service.py`)

Ky shërbim trajton të gjithë komunikimin me ekosistemin Supabase.

### Funksionalitetet kryesore:
1.  **Menaxhimi i të Dhënave**:
    -   `list_songs()`: Merr listën e këngëve me filtra dhe renditje.
    -   `get_playlist_by_id()`: Merr playlist-ën bashkë me të gjitha këngët e lidhura me të (join query).
    -   `create_playlist()` i `update_playlist()`: Menaxhimi i koleksioneve.
2.  **Autentifikimi**:
    -   `create_user()`: Regjistron përdoruesin në Supabase Auth.
    -   `login_user()`: Identifikon përdoruesin dhe kthen JWT.
3.  **Ndërveprimi me Storage**:
    -   Kur një këngë ngarkohet, shërbimi ruan skedarin në Supabase Bucket dhe kthen URL-në publike.

## Spotify Service (`spotify_service.py`)

Ky shërbim përdoret për të pasuruar eksperiencën e përdoruesit me të dhëna nga Spotify.

### Përdorimi:
-   **Kërkimi i Metadata-ve**: Kur një admin dëshiron të shtojë një këngë, mund të kërkojë në Spotify për të marrë automatikisht titullin, artistin dhe kopertinën (cover image).
-   **Link-et e Shkarkimit/Luajtjes**: Merr informacione për mundësitë e dëgjimit të një kënge.

## Admin Service (`admin_service.py`)

Përmban operacione që kërkojnë rol administrues.

### Operacionet:
-   **Upload i Këngëve**: Proceson skedarët audio dhe imazhet, validon formatet (MP3, WAV, PNG, JPG) dhe i dërgon në storage.
-   **Mirëmbajtja e DB**: Fshirja e këngëve të vjetra, pastrimi i playlist-ave të zbrazëta.
-   **Monitorimi**: Ofron të dhëna për numrin e përdoruesve aktivë dhe numrin total të këngëve.

## Injektimi i Shërbimeve (Dependency Injection)

Në FastAPI, këto shërbime instancohen dhe përdoren në rrugët e API-t (routes) në këtë mënyrë:

```python
from app.services.supabase_service import SupabaseService

supabase_service = SupabaseService()

@router.get("/songs")
def get_songs():
    return supabase_service.list_songs()
```

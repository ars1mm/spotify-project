# Backend - Implementimi Teknik

> **Shënim**: Ky dokument ofron një përmbledhje teknike. Për dokumentim të detajuar për çdo modul, vizitoni folderin: [**dokumentimi/backend/**](./backend/README.md)

## Përmbledhje

Backend-i është ndërtuar me **FastAPI (Python)**, duke përdorur **PostgreSQL** (via Supabase) për ruajtjen e të dhënave, **Redis** (opsionale) për rate limiting, dhe **Supabase** për autentifikim dhe storage. Ofron një REST API të plotë, të shpejtë dhe të sigurt.

## Arkitektura e Projektit

Sistemi ndjek një strukturë të pastër dhe modulare:

```text
backend/
├── app/                      # Kodi kryesor i aplikacionit
│   ├── api/                  # Rrugët e API-t (Routes)
│   ├── core/                 # Konfigurimet dhe siguria
│   ├── services/             # Logjika e biznesit (Supabase, Spotify)
│   ├── schemas/              # Validimi i të dhënave (Pydantic)
│   └── main.py               # Pika e nisjes së serverit
```

## Modulet Kryesore (Detaje të Shpejta)

### 1. Integrimi me Supabase
Përdoret si "Backend as a Service" për:
- **Database**: Ruajtja e këngëve, përdoruesve dhe llogarive.
- **Auth**: Menaxhimi i sesioneve dhe vërtetimi i përdoruesve.
- **Storage**: Ruajtja e skedarëve `.mp3` dhe imazheve të kopertinave.

### 2. Integrimi me Spotify API
Përdoret për të pasuruar bazën tonë të të dhënave me metadata të sakta për këngët dhe për të ofruar një eksperiencë kërkimi më të pasur.

### 3. Siguria dhe Mbrojtja
- **Rate Limiting**: Përdorimi i `SlowAPI` për të kufizuar numrin e kërkesave për IP.
- **CORS**: Lejimi i kërkesave vetëm nga frontend-i ynë i autorizuar.
- **JWT**: Verifikimi i çdo kërkese private përmes token-ave.

---

## Dokumentimi i Detajuar

Për shpjegime më të hollësishme për çdo komponent, ju lutem referojuni skedarëve të mëposhtëm:

1.  **[Struktura dhe Arkitektura](./backend/01-struktura-dhe-arkitektura.md)**
2.  **[Referenca e API-t (Endpoints)](./backend/02-api-endpoints.md)**
3.  **[Shërbimet e Sistemit (Services)](./backend/03-sherbimet.md)**
4.  **[Siguria dhe Autentifikimi](./backend/04-siguria-dhe-autentifikimi.md)**
5.  **[Paneli i Administrimit](./backend/05-admin-panel.md)**

---

*Ky dokument është përditësuar së fundmi më 24 Dhjetor 2025.*

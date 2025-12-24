# Dokumentimi i Implementimit të Bazës së të Dhënave

Ky dokument shërben si një pikë hyrëse për implementimin e bazës së të dhënave në projektin Spotify Clone. Për dokumentim më të detajuar sipas moduleve, ju lutemi referojuni dosjes kryesore:

👉 [**Dokumentimi i Detajuar i Databazës (Modul pas Moduli)**](./database/README.md)

---

## Përmbledhje e Implementimit

Sistemi përdor **PostgreSQL** të menaxhuar nga **Supabase** për të siguruar një platformë të qëndrueshme dhe të shkallëzueshme.

### Teknologjitë Kryesore
*   **Database**: PostgreSQL 15+
*   **ORM**: SQLAlchemy (për Backend)
*   **Auth**: Supabase Auth (JWT)
*   **Storage**: Supabase Storage
*   **Migrations**: Alembic & SQL Scripts

### Struktura e Dosjes së Dokumentimit
Dokumentimi i ri modular është ndarë në:
*   **01-struktura-dhe-arkitektura.md**: Detajet e dizajnit të sistemit.
*   **02-skema-e-tabelave.md**: Detajet teknike të çdo tabele.
*   **03-marredheniet.md**: Lidhjet dhe integriteti referencial.
*   **04-siguria-dhe-rls.md**: Rregullat e sigurisë në nivel rreshti.
*   **05-indekset-dhe-performanca.md**: Optimizimi i qasjes në të dhëna.
*   **06-migrimet-dhe-backup.md**: Plani i mirëmbajtjes dhe rikuperimit.
*   **07-integrimi-me-storage.md**: Menaxhimi i skedarëve audio dhe imazheve.

---
*Për informacione rreth API-ve që ndërveprojnë me këtë bazë të dhënash, shihni [Dokumentimin e Backend-it](./backend/README.md).*

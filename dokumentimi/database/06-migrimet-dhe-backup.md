# Migrimet dhe Strategjia e Backup-it

Menaxhimi i ndryshimeve në skemë dhe siguria e të dhënave janë kritike për vazhdimësinë e projektit.

## Menaxhimi i Migrimeve

Projekti përdor dy metoda për menaxhimin e ndryshimeve:

1.  **SQL Skriptet (Supabase Dashbord)**: Për ndryshime të shpejta në fillim dhe për konfigurimin e RLS. Skedarët ruhen në `backend/sql/`.
2.  **Alembic (Backend)**: Për sinkronizimin e modeleve SQLAlchemy me bazën e të dhënave në produksion.

### Konventat e Migrimit
*   Çdo migrim duhet të ketë një funksion `upgrade()` dhe `downgrade()`.
*   Emrat e migrimeve duhet të jenë përshkrues (p.sh., `001_initial_schema`).

## Strategjia e Backup-it

Duke qenë se përdorim Supabase, përfitojmë nga menaxhimi i tyre automatik:

1.  **Daily Backups**: Supabase bën backup të plotë çdo ditë të gjithë bazës së të dhënave.
2.  **Point-In-Time Recovery (PITR)**: Na lejon të kthejmë bazën e të dhënave në çdo sekondë specifike brenda 7 ditëve të fundit (në varësi të planit).
3.  **Manual Dumps**: Mund të gjenerojmë një kopje lokale përmes CLI:
    ```bash
    supabase db dump -f local_backup.sql
    ```

## Procesi i Restore-it
Në rast avarie:
1.  Verifikohet versioni i fundit i qëndrueshëm.
2.  Përdoret funksioni manual "Restore" nga portali i Supabase.
3.  Rikontrollohen rregullat RLS pas çdo restore-i.

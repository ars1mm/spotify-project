# Integrimi me Supabase Storage

Megjithëse nuk është pjesë e bazës së të dhënave relacionale në sensin strikt, Storage është i lidhur ngushtë përmes shtigjeve të skedarëve (`file_path`).

## Bucket-et Kryesore

1.  **songs**: Ruan skedarët audio (mp3, wav).
2.  **covers**: Ruan imazhet e këngëve dhe playlist-eve.
3.  **avatars**: Ruan imazhet e profilit të përdoruesve.

## Lidhja me Databazën

Në tabelën `songs`, ne nuk ruajmë URL-në e plotë (e cila mund të ndryshojë), por ruajmë vetëm `file_path`. URL-ja gjenerohet dinamikisht nga Backend-i ose Frontend-i:

```python
# Shembull i gjenerimit të URL-së në Backend
audio_url = f"{SUPABASE_URL}/storage/v1/object/public/songs/{song.file_path}"
```

## Siguria e Storage

Bucket-et janë të konfiguruara si **Public** për lehtësi aksesi në lexim, por modifikimi/fshirja lejohet vetëm përmes Backend-it duke përdorur `service_role_key` ose pas verifikimit të JWT të përdoruesit në raste specifike.

## Konsistenca e të Dhënave
Kur fshihet një rekord në tabelën `songs`, Backend-i është përgjegjës për të fshirë edhe skedarin fizik në Storage për të shmangur grumbullimin e skedarëve të panevojshëm ("orphaned files").

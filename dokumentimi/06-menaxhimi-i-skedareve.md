# Menaxhimi i Skedarëve (Upload & Storage)

## Përmbledhje

Ky dokument përshkruan procesin e ngarkimit, validimit, ruajtjes dhe menaxhimit të skedarëve audio dhe imazheve të cover-it. Sistemi përdor Supabase Storage si vendin kryesor për ruajtje dhe PostgreSQL për metadata.

## Rrjedha e Upload-it

1. Përdoruesi zgjedh audio dhe (opsionalisht) imazhin e cover-it në frontend.
2. Frontend dërgon request POST /api/v1/songs me multipart/form-data.
3. Backend validon skedarin, gjeneron emër unik dhe e ngarkon në Supabase Storage.
4. Backend përfiton URL-in publik të skedarit dhe ruan metadata në PostgreSQL.

## Kërkesat për Skedarët

- Audio: mp3, wav, m4a (rekomandohet mp3)
- Max madhësia për audio: 50MB (mund të rritet sipas konfigurimit)
- Cover image: jpg, jpeg, png, webp
- Max madhësia për cover: 5MB

## Validimi në Backend

- Kontrollimi i tipit MIME dhe extension-it
- Kontrolli i madhësisë maksimale
- Skimming i metadata-s (p.sh. të dhënat ID3 kur është e nevojshme)
- Verifikimi i autorizimit (vetëm përdoruesit e regjistruar mund të ngarkojnë)

### Shembull i Handler-it (përmbledhje)

```python
@router.post('/songs')
async def upload_song(
    file: UploadFile = File(...),
    title: str = Form(...),
    artist: str = Form(...),
    cover_image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1) Validate file type and size
    # 2) Upload file to Supabase Storage
    # 3) Optionally upload cover image
    # 4) Extract duration, create DB record with audio_url
    pass
```

## Supabase Storage

- Përdorni një bucket të dedikuar (p.sh. audio) me rregulla të aksesit të përshtatshme.
- Për skedarë publikë, gjeneroni URL publik; për skedarë private, përdorni signed URLs.
- Ruani vetëm path/URL në bazën e të dhënave, jo përmbajtjen.

## Emërtimi dhe Organizimi

- Strukturë sugjeruar: audio/{year}/{month}/{uuid}.{ext}
- Cover images: covers/{year}/{month}/{uuid}.{ext}

## Processing pas Upload-it

- Nxjerrja e kohëzgjatjes së audio (ffmpeg/mediainfo)
- Gjenerimi i formateve alternative (opsional)
- Kompresimi i imazheve dhe krijimi i thumbnails

## Siguria

- Kontroll MIME + extension
- Skedat skanohen për përmbajtje të dëmshme (opsional, external scanner)
- Për skedarë të ndjeshëm përdorni signed URLs me expiry

## Rekomandime për Përmirësim

- Shtoni background worker për përpunime të rënda (p.sh. transkodim)
- Implementoni rate limiting për endpoint-in e upload
- Mbani quotas përdoruesish për hapësirë

# Paneli i Administrimit (Admin Backend)

Sistemi i administrimit lejon menaxhimin e përmbajtjes muzikore të aplikacionit.

## Rrugët e Admin-it (`app/api/admin.py`)

Këto rrugë janë të ndara nga ato të përdoruesve të thjeshtë për siguri dhe organizim më të mirë. Çdo kërkesë këtu duhet të jetë e autorizuar.

### Ngarkimi i Këngëve (Song Upload)
Procesi i shtimit të një kënge të re ndjek këto hapa:
1.  **Metadata**: Admini mund të specifikojë Titullin, Artistin dhe Albumin.
2.  **Audio File**: Skedari (zakonisht .mp3) ngarkohet në bucket-in `songs` në Supabase Storage.
3.  **Cover Image**: Imazhi i kopertinës ngarkohet në bucket-in `covers`.
4.  **Database Entry**: Pasi skedarët ngarkohen me sukses, një rekord i ri shtohet në tabelën `songs` me URL-të përkatëse.

### Menaxhimi i Këngëve
-   **Fshirja**: Kur një këngë fshihet, sistemi fshin të dhënat nga DB dhe gjithashtu heq skedarët audio/image nga Storage për të kursyer hapësirë.
-   **Përditësimi**: Ndryshimi i metadata-ve pa pasur nevojë për ri-ngarkim të skedarit.

## Integrimi me Spotify për Admin-ët

Për të lehtësuar punën e administratorit, ne kemi integruar një funksion "Auto-fill":
-   Admini kërkon një këngë sipas emrit.
-   Sistemi merr të dhënat nga Spotify API.
-   Format plotësohen automatikisht me emrin e saktë, artistin dhe URL-në e kopertinës me kualitet të lartë.

## Statistikat e Sistemit
Admin Dashboard-i shfaq:
-   Numrin total të këngëve të disponueshme.
-   Numrin e përdoruesve të regjistruar.
-   Këngët më të pëlqyera.
-   Statistikat e përdorimit të hapësirës (Storage usage).

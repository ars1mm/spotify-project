# Player-i Audio (Audio Player)

Player-i audio është komponenti më kritik i aplikacionit. Ai nuk është thjesht një element `<audio>`, por një sistem i tërë i integruar.

## Logjika e Luajtjes

Player-i funksionon duke u bazuar në URL-të e skedarëve audio që vijnë nga backend-i (të ruajtura në **Supabase Storage**).

### Komponenti `Player.tsx`
Ky komponent përdor `useRef` për të mbajtur një referencë te objekti `HTMLAudioElement`.
-   **Sinkronizimi**: Kur `currentSong` ndryshon në context, Player ngarkon `src`-in e ri dhe thërret `.play()`.
-   **Event Listeners**: Player dëgjon evente si `timeupdate` (për të përditësuar progress bar) dhe `ended` (për të kaluar automatikisht te kënga tjetër).

## Funksionalitetet e Avancuara

1.  **Queue Management**:
    -   Përdoruesi mund të klikojë "Play" në një playlist.
    -   Të gjitha këngët e playlist-ës shtohen në `queue`.
    -   Sistemi mban mend pozicionin aktual në listë.

2.  **Shuffle (Përzierja)**:
    -   Kur shuffle është aktiv, kënga tjetër përzgjidhet rastësisht nga lista, duke u siguruar që të mos përsëritet e njëjta këngë deri në fund të listës.

3.  **Visual Feedback**:
    -   Slider-i i kohës tregon progresin në formatin `minuta:sekonda`.
    -   Imazhi i këngës rrotullohet ose shfaqet me efekte vizuale kur muzika është aktive.

## Optimizimi i Performancës

-   **Pre-fetching**: Sistemi mund të fillojë ngarkimin e këngës tjetër në sfond për të eliminuar vonesat (shënim: funksionalitet në zhvillim).
-   **Audio Compression**: Backend-i shërben skedarë të optimizuar për streaming që të mos rëndojnë bandën e internetit të përdoruesit.

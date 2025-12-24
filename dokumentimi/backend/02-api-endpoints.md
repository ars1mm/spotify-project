# Referenca e API-t (API Endpoints)

Ky dokument liston të gjitha pikat e hyrjes (endpoints) që ofron backend-i për frontend-in.

## Autentifikimi (`/api/v1/auth`)

| Metoda | Endpoint | Përshkrimi |
| :--- | :--- | :--- |
| `POST` | `/auth/signup` | Krijon një llogari të re përdoruesi. |
| `POST` | `/auth/login` | Identifikon përdoruesin dhe kthen sessionin. |
| `POST` | `/auth/reset-password` | Dërgon email për rivendosjen e fjalëkalimit. |
| `POST` | `/auth/update-password` | Përditëson fjalëkalimin e përdoruesit. |

## Këngët (`/api/v1/songs`)

| Metoda | Endpoint | Përshkrimi |
| :--- | :--- | :--- |
| `GET` | `/songs` | Merr listën e të gjitha këngëve (me pagination). |
| `GET` | `/songs/liked` | Merr këngët e pëlqyera të një përdoruesi. |
| `POST` | `/songs/{id}/like` | Pëlqen (like) një këngë. |
| `DELETE` | `/songs/{id}/like` | Heq pëlqimin nga një këngë. |
| `GET` | `/trending/songs` | Merr këngët më të njohura aktualisht. |

## Playlist-at (`/api/v1/playlists`)

| Metoda | Endpoint | Përshkrimi |
| :--- | :--- | :--- |
| `GET` | `/playlists` | Merr listën e playlist-ave (publike ose të përdoruesit). |
| `GET` | `/playlists/{id}` | Merr detajet dhe këngët e një playlist-e specifike. |
| `POST` | `/playlists` | Krijon një playlist të re. |
| `PUT` | `/playlists/{id}` | Përditëson detajet e një playlist-e. |
| `POST` | `/playlists/{pid}/songs/{sid}` | Shton një këngë në playlist. |
| `DELETE` | `/playlists/{pid}/songs/{sid}` | Heq një këngë nga playlist-a. |

## Kërkimi dhe Lajmet (`/api/v1/`)

| Metoda | Endpoint | Përshkrimi |
| :--- | :--- | :--- |
| `GET` | `/search` | Kërkon për këngë në bazën e të dhënave. |
| `GET` | `/track/download` | Merr informacione shkarkimi nga Spotify. |
| `GET` | `/trending/albums` | Merr albumet më të njohura. |

## Paneli i Administrimit (`/api/v1/admin`)

Këto rrugë janë të mbrojtura dhe kërkojnë çelësin e administratorit ose session admin.

| Metoda | Endpoint | Përshkrimi |
| :--- | :--- | :--- |
| `POST` | `/admin/songs/upload` | Ngarkon një këngë të re në storage dhe DB. |
| `DELETE` | `/admin/songs/{id}` | Fshin një këngë përfundimisht. |
| `GET` | `/admin/stats` | Merr statistikat e sistemit (përdorues, këngë). |

---

## Formatet e Të Dhënave

- **Kërkesat (Requests)**: Duhet të jenë në formatin JSON (përveç upload-it që është `multipart/form-data`).
- **Përgjigjet (Responses)**: Të gjitha përgjigjet kthehen si objekte JSON.
- **Gabimet (Errors)**: Kthehen me status kode standarde HTTP (400, 401, 403, 404, 500) dhe një objekt:
  ```json
  {
    "detail": "Mesazhi i gabimit këtu"
  }
  ```

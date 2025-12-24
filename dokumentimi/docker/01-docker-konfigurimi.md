# Konfigurimi i Docker për Backend

## Përmbledhje

Sistemi përdor Docker për të kontejnerizuar shërbimet e backend-it (FastAPI), duke siguruar që aplikacioni të funksionojë në mënyrë identike në çdo mjedis (development, staging, production).

## Dockerfile e Backend-it

Mesazhi kryesor i `Dockerfile` është ndërtimi i një imazhi të lehtë dhe të shpejtë bazuar në Python 3.11.

### Struktura e Dockerfile:

```dockerfile
# Përdorimi i një imazhi zyrtar të Python
FROM python:3.11-slim

# Vendosja e direktorisë së punës
WORKDIR /app

# Instalimi i varësive të sistemit (nëse nevojiten)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Kopjimi i kërkesave dhe instalimi i tyre
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopjimi i kodit të aplikacionit
COPY . .

# Ekspozimi i portës (FastAPI përdor portën 8000)
EXPOSE 8000

# Komanda për nisjen e serverit
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Optimëzimi i Imazhit

1.  **Slim Base Image**: Përdorim `python:3.11-slim` për të reduktuar madhësinë e imazhit.
2.  **.dockerignore**: Përdoret për të shmangur kopjimin e skedarëve të panevojshëm si `.git`, `__pycache__`, dhe `.env`.
3.  **Layer Caching**: Instalimi i `requirements.txt` bëhet përpara kopjimit të kodit për të përshpejtuar ndërtimet (builds) e ardhshme.

## Ndërtimi Manual

Për të ndërtuar imazhin lokalisht:
```bash
docker build -t spotify-backend:latest ./backend
```

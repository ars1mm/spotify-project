# Deployment & Rekomandime

Ky dokument përmbledh mënyrat e deployimit të projektit për development dhe production.

## Environment

Përdorni variabla mjedisi për konfigurim: `BACKEND_URL`, `DATABASE_URL`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET_KEY`, etj.

## Docker (lokal)

Shembull me `docker-compose` (në root të projektit ka `docker-compose.yml`). Për development:

```bash
# Ngrit shërbimet
docker-compose up --build

# Ngrit vetëm backend
docker-compose up --build backend
```

Sigurohuni që `.env` është i vendosur dhe `requirements.txt` është i përditësuar.

## Migrimet

Për të ekzekutuar migrimet (Alembic):

```bash
# Në container ose venv të projektit
alembic upgrade head
```

## Build Frontend

```bash
cd frontend
npm install
npm run build
```

## Kubernetes (production)

Në `backend/k8s/` ka skedarë `deployment.yaml` dhe `service.yaml` si fillestare. Shembull i shkurtër:

```bash
# Aplikoni konfigurimet
kubectl apply -f backend/k8s/deployment.yaml
kubectl apply -f backend/k8s/service.yaml
```

Rekomandohet:

- Ruajtja e secrets në `kubectl` (Kubernetes Secrets) ose HashiCorp Vault
- Përdorimi i Ingress për HTTPS (cert-manager + Let's Encrypt)
- Horizontal Pod Autoscaling për backend
- Read replicas për PostgreSQL dhe managed DB për production (p.sh. Supabase/Postgres Cloud)

## Supabase

- Konfiguroni bucket-in dhe çelësat e duhur: `SUPABASE_SERVICE_ROLE_KEY` për backend dhe `NEXT_PUBLIC_SUPABASE_ANON_KEY` për frontend (vetëm kur është e nevojshme).

## Praktika të Sigurisë

- Mos e vendosni `SERVICE_ROLE_KEY` në frontend.
- Shfaqni vetëm variablat e nevojshme si `NEXT_PUBLIC_*` për frontend.
- Përdorni HTTPS, CORS të ngushtë dhe rate limiting.

## Rollback

- Mbani backup-e të rregullta (`pg_dump`) dhe një plan restore.
- Për migrime problematike, përdorni `alembic downgrade` me kujdes.

## Monitoring

- Shtoni health checks, logging (structured logs), metrics (Prometheus) dhe alerting.

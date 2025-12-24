# Planifikimi i Kubernetes dhe Skalimi i Ardhshëm

## Përmbledhje

Për të përballuar një numër të madh përdoruesish dhe për të garantuar që aplikacioni të mos ndalojë (High Availability), ne planifikojmë të kalojmë në **Kubernetes (K8s)**.

## Pse Kubernetes?

Kur aplikacioni rritet, Docker Compose nuk mjafton për të menaxhuar:
1.  **Skalimin Automatik**: Shtimi i instancave të Backend-it kur rritet trafiku (HPA).
2.  **Self-healing**: Nëse një kontejner dështon, K8s e rinis atë automatikisht.
3.  **Zero-downtime Deployments**: Përditësimi i kodit pa ndërprerë shërbimin për përdoruesit (Rolling Updates).
4.  **Load Balancing**: Shpërndarja e kërkesave në shumë instanca (Pods).

## Arkitektura e Planifikuar

### 1. Pods dhe Replicas
Planifikojmë të fillojmë me të paktën **2 deri në 3 replica** të Backend-it në mjedisin e produksionit.

### 2. Services
*   **ClusterIP**: Për komunikim të brendshëm ndërmjet Backend-it dhe Redis.
*   **LoadBalancer**: Për të ekspozuar Backend-in në internet në mënyrë të sigurt.

### 3. Konfigurimet (ConfigMaps & Secrets)
Të gjitha variablat e mjedisit (Environment Variables) dhe sekretet (API Keys, Database URLs) do të menaxhohen përmes objekteve `ConfigMap` dhe `Secret` të Kubernetes.

## Implementimi i Ardhshëm (Hapat)

### Faza 1: Kontejnerizimi Total
*   Krijimi i Dockerfile për Frontend-in dhe optimizimi i tij me Nginx (Multi-stage build).
*   Testimi i orkestrimit lokal me Minikube.

### Faza 2: Helm Charts
Krijimi i paketave Helm për të menaxhuar instalimet e K8s në mënyrë të deklaruar dhe të ripërdorshme.

### Faza 3: CI/CD Pipeline
Integrimi i GitHub Actions për të ndërtuar automatikisht imazhet dhe për t'i dërguar ato në një Registry (p.sh. Docker Hub ose AWS ECR), dhe më pas bërja e deploy të automatizuar në K8s.

## Komandat Fillestare (K8s)

```bash
# Aplikimi i konfigurimeve ekzistuese në backend/k8s
kubectl apply -f backend/k8s/
```

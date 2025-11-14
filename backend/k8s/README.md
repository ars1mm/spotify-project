# Kubernetes Deployment

## Role of Kubernetes in This Application

Kubernetes orchestrates the Spotify backend application by:
- **Scaling**: Automatically manages multiple backend instances (2 replicas)
- **Load Balancing**: Distributes traffic across healthy pods
- **Self-Healing**: Restarts failed containers automatically
- **Secret Management**: Securely stores API credentials
- **Service Discovery**: Provides stable network endpoints

## Manual Deployment Commands

### 1. Build Docker Image
```bash
docker build -t spotify-backend:latest .
```

### 2. Create Secret
```bash
# Windows
copy k8s\secret-template.yaml k8s\secret.yaml

# Linux/Mac
cp k8s/secret-template.yaml k8s/secret.yaml

# Get base64 encoded key
echo -n "your_api_key" | base64
# Edit k8s/secret.yaml with the encoded key
```

### 3. Deploy to Kubernetes
```bash
kubectl apply -f k8s/
```

### 4. Check Deployment Status
```bash
kubectl get pods -l app=spotify-backend
kubectl get services
```

### 5. Access Application
```bash
kubectl port-forward service/spotify-backend-service 8000:80
```

### 6. View Logs
```bash
kubectl logs -l app=spotify-backend
```

### 7. Clean Up
```bash
kubectl delete -f k8s/
```

## Prerequisites
- kubectl installed
- Kubernetes cluster running (Docker Desktop, minikube, etc.)
- Docker image built locally
---
sidebar_position: 3
---

# Deploying to Kubernetes

Kubosun includes Kustomize manifests in the `deploy/` directory for deploying to any Kubernetes cluster.

## Directory Structure

```
deploy/
├── kustomization.yaml    # Kustomize config (namespace: kubosun)
├── deployment.yaml       # Backend + Frontend Deployments
└── service.yaml          # Services, ServiceAccount, Secret template
```

## Prerequisites

- Kubernetes 1.24+ cluster
- `kubectl` configured with cluster access
- Container images pushed to a registry accessible from the cluster

## Step 1: Build and Push Images

Build the container images and push them to your registry:

```bash
# Backend
docker build -t your-registry/kubosun-backend:latest ./backend
docker push your-registry/kubosun-backend:latest

# Frontend
docker build -t your-registry/kubosun-frontend:latest ./frontend
docker push your-registry/kubosun-frontend:latest
```

## Step 2: Configure the Secret

Edit `deploy/service.yaml` and replace the placeholder values in the Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kubosun-secrets
type: Opaque
stringData:
  KUBOSUN_ANTHROPIC_API_KEY: "sk-ant-your-actual-key"
  KUBOSUN_SESSION_SECRET: "<generate-random-string>"
  KUBOSUN_OAUTH_CLIENT_ID: "kubosun-console"
  KUBOSUN_OAUTH_CLIENT_SECRET: "<your-oidc-client-secret>"
  KUBOSUN_OAUTH_ISSUER_URL: "https://your-oidc-provider.example.com"
  KUBOSUN_OAUTH_REDIRECT_URI: "https://kubosun.example.com/auth/callback"
```

Generate a session secret:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 3: Update Image References

Edit `deploy/deployment.yaml` and replace the image references with your registry:

```yaml
# Backend deployment
image: your-registry/kubosun-backend:latest

# Frontend deployment
image: your-registry/kubosun-frontend:latest
```

Also update the `KUBOSUN_CORS_ORIGINS` environment variable to match your ingress domain:

```yaml
- name: KUBOSUN_CORS_ORIGINS
  value: '["https://kubosun.example.com"]'
```

## Step 4: Deploy with Kustomize

```bash
# Preview what will be created
kubectl kustomize deploy/

# Apply to cluster
kubectl apply -k deploy/

# Verify pods are running
kubectl get pods -n kubosun

# Check logs
kubectl logs -l app.kubernetes.io/name=kubosun -n kubosun
```

## Step 5: Expose the Service

Create an Ingress (adjust for your ingress controller):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kubosun
  namespace: kubosun
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
spec:
  rules:
    - host: kubosun.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kubosun-frontend
                port:
                  number: 3000
  tls:
    - hosts:
        - kubosun.example.com
      secretName: kubosun-tls
```

The long proxy timeouts are needed for SSE connections (AI chat and resource watches).

## Manifest Details

### Deployments

The `deployment.yaml` defines two Deployments:

**kubosun-backend:**
- Uses ServiceAccount `kubosun` for in-cluster K8s API access
- Reads secrets from `kubosun-secrets` via `envFrom`
- Sets `KUBOSUN_K8S_IN_CLUSTER=true` and `KUBOSUN_OAUTH_ENABLED=true`
- Liveness/readiness probes on `/health` port 8000
- Resources: 100m-500m CPU, 256Mi-512Mi memory

**kubosun-frontend:**
- Connects to backend via `BACKEND_URL=http://kubosun-backend:8000`
- Liveness/readiness probes on `/api/health` port 3000
- Resources: 100m-300m CPU, 128Mi-256Mi memory

### Services

- `kubosun-backend` — ClusterIP on port 8000
- `kubosun-frontend` — ClusterIP on port 3000

### ServiceAccount

The `kubosun` ServiceAccount needs read access to cluster resources. Bind it to a ClusterRole:

```bash
kubectl create clusterrolebinding kubosun-reader \
  --clusterrole=view \
  --serviceaccount=kubosun:kubosun
```

For full functionality (AI agent create/delete), use a more permissive role or create a custom one scoped to the needed resources.

## Updating

After pushing new images:

```bash
kubectl rollout restart deployment kubosun-backend kubosun-frontend -n kubosun
kubectl rollout status deployment kubosun-backend kubosun-frontend -n kubosun
```

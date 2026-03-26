---
sidebar_position: 3
---

# Configuration

All backend configuration is managed through environment variables with the `KUBOSUN_` prefix, loaded via Pydantic settings.

## Environment File

Create `backend/.env.local` for local development:

```bash
# Server
KUBOSUN_DEBUG=true
KUBOSUN_HOST=0.0.0.0
KUBOSUN_PORT=8000

# Kubernetes
KUBOSUN_K8S_IN_CLUSTER=false
KUBOSUN_KUBECONFIG_PATH=~/.kube/config

# AI
KUBOSUN_ANTHROPIC_API_KEY=sk-ant-your-key-here
KUBOSUN_AI_MODEL=claude-sonnet-4-20250514

# CORS
KUBOSUN_CORS_ORIGINS=["http://localhost:3000"]

# OAuth (optional — omit for kubeconfig-based dev mode)
# KUBOSUN_OAUTH_ENABLED=true
# KUBOSUN_OAUTH_PROVIDER=openshift
# KUBOSUN_OAUTH_CLIENT_ID=kubosun-console
# KUBOSUN_OAUTH_CLIENT_SECRET=your-secret
# KUBOSUN_OAUTH_ISSUER_URL=https://oauth.cluster.example.com
# KUBOSUN_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
# KUBOSUN_OAUTH_SCOPES=user:full
# KUBOSUN_SESSION_SECRET=generate-a-random-string
# KUBOSUN_SESSION_MAX_AGE=86400
```

## Environment Variables Reference

### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBOSUN_HOST` | `0.0.0.0` | Bind address |
| `KUBOSUN_PORT` | `8000` | Bind port |
| `KUBOSUN_DEBUG` | `false` | Enable debug mode |

### Kubernetes

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBOSUN_K8S_API_SERVER` | `https://kubernetes.default.svc` | K8s API server URL |
| `KUBOSUN_K8S_IN_CLUSTER` | `false` | Use in-cluster ServiceAccount auth |
| `KUBOSUN_KUBECONFIG_PATH` | `None` | Path to kubeconfig file (dev mode) |

### AI

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBOSUN_ANTHROPIC_API_KEY` | `""` | Anthropic API key for Claude |
| `KUBOSUN_AI_MODEL` | `claude-sonnet-4-20250514` | Claude model to use |

### CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBOSUN_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |

### OAuth2/OIDC

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBOSUN_OAUTH_ENABLED` | `false` | Enable OAuth authentication |
| `KUBOSUN_OAUTH_PROVIDER` | `openshift` | Provider type: `openshift` or `oidc` |
| `KUBOSUN_OAUTH_CLIENT_ID` | `""` | OAuth client ID |
| `KUBOSUN_OAUTH_CLIENT_SECRET` | `""` | OAuth client secret |
| `KUBOSUN_OAUTH_ISSUER_URL` | `""` | OAuth/OIDC issuer URL |
| `KUBOSUN_OAUTH_REDIRECT_URI` | `http://localhost:3000/auth/callback` | Redirect URI after login |
| `KUBOSUN_OAUTH_SCOPES` | `user:full` | OAuth scopes to request |
| `KUBOSUN_SESSION_SECRET` | `change-me-in-production` | Secret for signing session cookies |
| `KUBOSUN_SESSION_MAX_AGE` | `86400` | Session lifetime in seconds (24h) |

## OAuth Setup for OpenShift

When deploying to OpenShift, create an OAuthClient custom resource:

```yaml
apiVersion: oauth.openshift.io/v1
kind: OAuthClient
metadata:
  name: kubosun-console
grantMethod: auto
secret: your-client-secret-here
redirectURIs:
  - https://kubosun.example.com/auth/callback
  - http://localhost:3000/auth/callback  # for local dev
```

Apply it to the cluster:

```bash
oc apply -f oauthclient.yaml
```

Then set the corresponding environment variables:

```bash
KUBOSUN_OAUTH_ENABLED=true
KUBOSUN_OAUTH_PROVIDER=openshift
KUBOSUN_OAUTH_CLIENT_ID=kubosun-console
KUBOSUN_OAUTH_CLIENT_SECRET=your-client-secret-here
KUBOSUN_OAUTH_ISSUER_URL=https://api.cluster.example.com:6443
```

## OAuth Setup for Generic OIDC

For non-OpenShift clusters, use any OIDC provider (Keycloak, Dex, Auth0, etc.):

```bash
KUBOSUN_OAUTH_ENABLED=true
KUBOSUN_OAUTH_PROVIDER=oidc
KUBOSUN_OAUTH_CLIENT_ID=kubosun
KUBOSUN_OAUTH_CLIENT_SECRET=your-oidc-secret
KUBOSUN_OAUTH_ISSUER_URL=https://keycloak.example.com/realms/k8s
KUBOSUN_OAUTH_SCOPES=openid profile email
```

The backend automatically discovers endpoints from the `/.well-known/openid-configuration` URL.

## Session Secret

For production, generate a strong random secret:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Set it as `KUBOSUN_SESSION_SECRET`. Never use the default value in production.

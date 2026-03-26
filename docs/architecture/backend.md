---
sidebar_position: 3
---

# Backend Architecture

The backend is a Python FastAPI application that acts as the gateway between the browser and the Kubernetes API server. It handles authentication, proxying, AI agent orchestration, and real-time event streaming.

## Directory Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry, middleware + router registration
│   ├── config.py             # Pydantic settings (KUBOSUN_* env vars)
│   ├── middleware/
│   │   └── auth.py           # AuthMiddleware — session cookie validation
│   ├── routers/
│   │   ├── health.py         # GET /health, GET /health/cluster
│   │   ├── auth.py           # GET /auth/login, /auth/callback, /auth/user, POST /auth/logout
│   │   ├── k8s.py            # ANY /api/kubernetes/\{path\} — K8s API proxy
│   │   ├── resources.py      # GET /api/resources — API discovery
│   │   ├── watch.py          # GET /api/watch/\{group\}/\{version\}/\{plural\} — SSE watch
│   │   ├── ai.py             # POST /api/ai/chat — AI agent (streaming SSE)
│   │   ├── cluster.py        # GET /api/cluster/summary — aggregated cluster health
│   │   └── permissions.py    # POST /api/permissions/check, /api/permissions/batch
│   └── services/
│       ├── k8s_client.py     # Kubernetes client initialization
│       ├── k8s_proxy.py      # HTTP proxy to K8s API server
│       ├── k8s_discovery.py  # API resource enumeration
│       ├── k8s_watch.py      # Watch event streaming
│       ├── k8s_rbac.py       # SelfSubjectAccessReview
│       ├── ai_tools.py       # K8S_TOOLS definitions + handlers
│       └── session.py        # Session cookie create/verify/read
└── tests/                    # pytest tests mirroring app/ structure
```

## Application Setup

The FastAPI app in `main.py` registers middleware and routers:

```python
app = FastAPI(title="Kubosun Backend")

# Middleware (order matters — first added = outermost)
app.add_middleware(AuthMiddleware)
app.add_middleware(CORSMiddleware, ...)

# Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(k8s.router)
app.include_router(resources.router)
app.include_router(watch.router)
app.include_router(ai.router)
app.include_router(cluster.router)
app.include_router(permissions.router)
```

## Authentication Middleware

The `AuthMiddleware` intercepts every request and:

1. **Skips auth** entirely when `KUBOSUN_OAUTH_ENABLED=false` (dev mode with kubeconfig).
2. **Skips auth** for public paths: `/health`, `/health/cluster`, `/auth/*`.
3. **Validates the session cookie** for all other requests.
4. **Attaches user context** to `request.state`:
   - `request.state.user_token` — the user's OAuth access token (used for K8s API calls)
   - `request.state.user_info` — user metadata (name, uid, email)

## Kubernetes Proxy

The `/api/kubernetes/\{path\}` endpoint proxies any HTTP method to the Kubernetes API server. It:

- Reads the request body for POST/PUT/PATCH
- Forwards the user's Bearer token (from `request.state.user_token`) for per-user RBAC
- Falls back to the ServiceAccount or kubeconfig token when no user token is available
- Filters out hop-by-hop response headers (`transfer-encoding`, `content-encoding`)

## Session Management

Sessions are signed cookies containing:

- User info (name, uid, email)
- OAuth access token (passed through to K8s API for RBAC)
- Refresh token
- Expiration timestamp

The session secret (`KUBOSUN_SESSION_SECRET`) is used to sign and verify cookies. Sessions expire after `KUBOSUN_SESSION_MAX_AGE` seconds (default 24 hours).

## Service Layer

| Service | File | Purpose |
|---------|------|---------|
| K8s Client | `k8s_client.py` | Initialize kubernetes-client (in-cluster or kubeconfig) |
| K8s Proxy | `k8s_proxy.py` | HTTP proxy to K8s API server |
| K8s Discovery | `k8s_discovery.py` | Enumerate API resource types |
| K8s Watch | `k8s_watch.py` | Watch events as async generator |
| K8s RBAC | `k8s_rbac.py` | SelfSubjectAccessReview checks |
| AI Tools | `ai_tools.py` | K8S_TOOLS definitions + execution |
| Session | `session.py` | Cookie-based session management |

## Configuration

All settings are defined in `config.py` using Pydantic `BaseSettings`:

```python
class Settings(BaseSettings):
    model_config = {"env_prefix": "KUBOSUN_", "env_file": ".env.local"}
```

This means every setting can be set via a `KUBOSUN_`-prefixed environment variable. See the [Configuration](../getting-started/configuration.md) page for the full list.

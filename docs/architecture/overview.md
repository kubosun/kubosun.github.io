---
sidebar_position: 1
---

# Architecture Overview

Kubosun Console follows a **three-layer architecture** where the browser never talks directly to the Kubernetes API server.

## System Architecture

```
Browser (Next.js)  --->  Python Backend (FastAPI)  --->  Kubernetes API Server
     |                        |                              |
  React Query              K8s Proxy                    cluster resources
  Zustand                  Auth Middleware               RBAC enforcement
  shadcn/ui                AI Agent (Claude)             watch events
  SSE client               Session Management            pod logs
```

### Layer 1: Frontend (Next.js 15)

The browser-side application built with Next.js App Router. It handles:

- **Rendering** — React components with file-based routing
- **State** — TanStack React Query for server state, Zustand for client state (namespace, preferences)
- **API calls** — All requests go to the Python backend via Next.js rewrites (`/api/*` proxied to backend)
- **Real-time** — SSE connections for resource watches
- **AI Chat** — Streaming SSE connection to the AI endpoint

### Layer 2: Backend (Python FastAPI)

The backend is the single gateway between the browser and the cluster. It handles:

- **K8s Proxy** — Forwards authenticated requests to the Kubernetes API server (`/api/kubernetes/*`)
- **Authentication** — OAuth2/OIDC login flow, session cookies, token management
- **AI Agent** — Claude tool-use loop with 8 Kubernetes tools
- **API Discovery** — Enumerates cluster resource types for the resource registry
- **Watch** — SSE streaming of Kubernetes watch events
- **RBAC** — SelfSubjectAccessReview checks via `/api/permissions/*`

### Layer 3: Kubernetes API Server

The standard Kubernetes (or OpenShift) API server. Kubosun uses:

- Standard REST API for CRUD operations
- Watch API for real-time resource events
- SelfSubjectAccessReview for RBAC checks
- Pod log and event APIs for diagnostics

## Request Flow

### Standard Resource Request

```
1. User navigates to /resources/apps/v1/deployments
2. Frontend calls GET /api/kubernetes/apis/apps/v1/namespaces/default/deployments
3. Next.js rewrites to backend at http://backend:8000/api/kubernetes/...
4. AuthMiddleware validates session cookie, extracts user token
5. K8s proxy forwards request to K8s API with user's Bearer token
6. Response flows back: K8s API -> backend -> Next.js -> browser
7. React Query caches the response and schedules refetch
```

### AI Chat Request

```
1. User types "list all crashing pods" in the chat panel
2. Frontend POSTs to /api/ai/chat with message history and namespace
3. Backend sends messages + K8S_TOOLS to Claude API
4. Claude decides to call list_resources and get_events tools
5. Backend executes tools against K8s API with user's token
6. Tool results sent back to Claude for interpretation
7. Claude produces a text response, streamed as SSE to the browser
8. Frontend renders the response incrementally
```

### Watch (Real-Time Updates)

```
1. Frontend opens SSE connection: GET /api/watch/apps/v1/deployments?namespace=default
2. Backend starts a Kubernetes watch on the specified resource
3. On each ADDED/MODIFIED/DELETED event, backend sends SSE data frame
4. Frontend's React Query cache is updated with the new resource state
5. UI re-renders automatically
```

## Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Backend language | Python | Native Anthropic SDK, async support, rapid prototyping |
| Frontend framework | Next.js App Router | File-based routing is AI-friendly for code generation |
| Real-time | SSE (not WebSocket) | Simpler proxying, automatic reconnection, HTTP/2 compatible |
| State management | React Query + Zustand | React Query for server state cache; Zustand for minimal client state |
| Auth model | Session cookies + token passthrough | Backend holds session; user's K8s token passed through for RBAC |

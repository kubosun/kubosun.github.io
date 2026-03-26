---
sidebar_position: 1
---

# Backend API Reference

All backend endpoints are served by the Python FastAPI application on port 8000. The frontend proxies requests through Next.js rewrites.

## Health

### GET /health

Returns backend service health status.

**Response:**

```json
{
  "status": "ok",
  "service": "kubosun-backend",
  "timestamp": "2026-03-26T12:00:00+00:00"
}
```

### GET /health/cluster

Checks Kubernetes cluster connectivity and returns cluster version info.

**Response (success):**

```json
{
  "status": "ok",
  "cluster": {
    "kubernetes_version": "v1.28.4",
    "platform": "linux/amd64"
  },
  "timestamp": "2026-03-26T12:00:00+00:00"
}
```

**Response (error):**

```json
{
  "status": "error",
  "error": "connection refused",
  "timestamp": "2026-03-26T12:00:00+00:00"
}
```

## Authentication

### GET /auth/login

Redirects to the OAuth provider's authorization page. Returns 400 if OAuth is not enabled.

**Query parameters:** None (OAuth config is read from server settings).

### GET /auth/callback

Handles the OAuth callback after user authorization. Exchanges the authorization code for an access token, fetches user info, creates a session cookie, and redirects to `/`.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Authorization code from OAuth provider |
| `state` | string | CSRF state token |

### POST /auth/logout

Clears the session cookie.

**Response:**

```json
{
  "status": "logged out"
}
```

### GET /auth/user

Returns the current authenticated user's info from the session.

**Response (authenticated):**

```json
{
  "authenticated": true,
  "user": {
    "name": "admin",
    "uid": "abc-123",
    "email": "admin@example.com"
  }
}
```

**Response (not authenticated):**

```json
{
  "error": "Not authenticated"
}
```

**Response (OAuth disabled):**

```json
{
  "authenticated": false,
  "oauth_enabled": false
}
```

## Kubernetes Proxy

### ANY /api/kubernetes/\{path\}

Proxies any HTTP method (GET, POST, PUT, PATCH, DELETE) to the Kubernetes API server. The path maps directly to the K8s API path.

**Examples:**

```
GET /api/kubernetes/api/v1/namespaces/default/pods
GET /api/kubernetes/apis/apps/v1/namespaces/default/deployments/my-app
POST /api/kubernetes/api/v1/namespaces/default/configmaps
DELETE /api/kubernetes/api/v1/namespaces/default/pods/my-pod
```

The request body, query parameters, and content type are forwarded. The user's OAuth token is passed as a Bearer token for RBAC enforcement.

## API Discovery

### GET /api/resources

Returns all discovered API resource models from the cluster.

**Response:**

```json
{
  "count": 142,
  "models": {
    "/v1/Pod": {
      "group": "",
      "version": "v1",
      "kind": "Pod",
      "plural": "pods",
      "namespaced": true,
      "verbs": ["create", "delete", "get", "list", "patch", "update", "watch"]
    }
  }
}
```

### GET /api/resources/\{group\}/\{version\}/\{kind\}

Returns a specific resource model. Use `core` as the group for core API resources.

**Example:** `GET /api/resources/core/v1/Pod`

## Watch (SSE)

### GET /api/watch/\{group\}/\{version\}/\{plural\}

Streams Kubernetes resource events via Server-Sent Events. Use `core` as the group for core API resources.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `namespace` | string (optional) | Filter by namespace |

**Example:** `GET /api/watch/apps/v1/deployments?namespace=default`

**SSE data frames:**

```json
{
  "type": "ADDED",
  "object": { "metadata": { "name": "my-deploy", ... }, ... }
}
```

Event types: `ADDED`, `MODIFIED`, `DELETED`.

## AI Chat

### POST /api/ai/chat

Streams an AI chat response with tool use via SSE. Returns 503 if the Anthropic API key is not configured.

**Request body:**

```json
{
  "messages": [
    { "role": "user", "content": "List all pods in the default namespace" }
  ],
  "namespace": "default"
}
```

**SSE data frames:**

| Type | Payload |
|------|---------|
| `text` | `{ "type": "text", "content": "Here are the pods..." }` |
| `tool_call` | `{ "type": "tool_call", "tool": "list_resources", "input": { "api_path": "..." } }` |
| `tool_result` | `{ "type": "tool_result", "tool": "list_resources", "result": "..." }` |
| `done` | `{ "type": "done" }` |

## Cluster Summary

### GET /api/cluster/summary

Returns aggregated cluster health, resource counts, and recent events.

**Response:**

```json
{
  "cluster": {
    "version": "v1.28.4",
    "platform": "linux/amd64"
  },
  "nodes": {
    "total": 3,
    "ready": 3,
    "notReady": 0
  },
  "counts": {
    "pods": 42,
    "deployments": 12,
    "services": 8,
    "namespaces": 5
  },
  "events": [
    {
      "type": "Normal",
      "reason": "Scheduled",
      "message": "Successfully assigned default/nginx-abc to node-1",
      "namespace": "default",
      "involvedObject": "Pod/nginx-abc",
      "lastTimestamp": "2026-03-26T11:55:00Z",
      "count": 1
    }
  ],
  "timestamp": "2026-03-26T12:00:00+00:00"
}
```

## Permissions

### POST /api/permissions/check

Check a single RBAC permission using SelfSubjectAccessReview.

**Request body:**

```json
{
  "verb": "delete",
  "resource": "pods",
  "group": "",
  "namespace": "default"
}
```

**Response:**

```json
{
  "allowed": true,
  "verb": "delete",
  "resource": "pods",
  "namespace": "default"
}
```

### POST /api/permissions/batch

Check multiple RBAC permissions in one call.

**Request body:**

```json
{
  "checks": [
    { "verb": "get", "resource": "pods", "namespace": "default" },
    { "verb": "delete", "resource": "deployments", "group": "apps", "namespace": "default" }
  ]
}
```

**Response:**

```json
{
  "results": [
    { "allowed": true, "verb": "get", "resource": "pods", "namespace": "default" },
    { "allowed": false, "verb": "delete", "resource": "deployments", "namespace": "default" }
  ]
}
```

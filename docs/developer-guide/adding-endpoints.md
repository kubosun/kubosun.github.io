---
sidebar_position: 3
---

# Adding Backend Endpoints

Backend endpoints are organized as FastAPI routers in `backend/app/routers/`. Each router handles a specific domain (health, auth, k8s, ai, etc.).

## Step 1: Create the Router

Create a new file `backend/app/routers/\{domain\}.py`:

```python
"""Alerts management endpoints."""

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertSummary(BaseModel):
    name: str
    severity: str
    state: str
    message: str


@router.get("")
async def list_alerts(request: Request) -> dict:
    """List active alerts from the cluster."""
    user_token = getattr(request.state, "user_token", None)
    # Implementation here
    return {"alerts": []}


@router.get("/\{name\}")
async def get_alert(name: str, request: Request) -> dict:
    """Get a specific alert by name."""
    user_token = getattr(request.state, "user_token", None)
    # Implementation here
    return {"alert": None}
```

### Conventions

- All handlers are `async`
- All functions have type hints
- Use Pydantic `BaseModel` for request and response schemas
- Access the user's K8s token via `request.state.user_token`
- Never hardcode URLs -- use `app.config.settings`
- Router prefix format: `/api/\{domain\}`

## Step 2: Register in main.py

Edit `backend/app/main.py`:

```python
from app.routers import ai, alerts, auth, cluster, health, k8s, permissions, resources, watch

# ... existing routers ...
app.include_router(alerts.router)
```

## Step 3: Add a Test

Create `backend/tests/test_alerts.py`:

```python
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data


def test_get_alert_not_found():
    response = client.get("/api/alerts/nonexistent")
    assert response.status_code == 200
```

## Step 4: Add a Frontend Rewrite

Edit `frontend/next.config.ts` to proxy the new endpoint to the backend:

```typescript
{
  source: '/api/alerts/:path*',
  destination: `${backendUrl}/api/alerts/:path*`,
}
```

This ensures that frontend requests to `/api/alerts/...` are proxied to the backend.

## Step 5: Verify

```bash
cd backend && ruff check . && pytest
```

## Using the Slash Command

Instead of doing this manually, use the `/add-api-endpoint` slash command in Claude Code:

```
/add-api-endpoint
```

It will prompt for the domain name, route prefix, and endpoints, then create all the files and register everything.

---
sidebar_position: 1
---

# Quick Start

Get Kubosun Console running locally and connected to a Kubernetes cluster.

## Option 1: Docker Compose (recommended)

The fastest way to start both services with a single command.

```bash
# Clone the repository
git clone https://github.com/kubosun/kubosun-console.git
cd kubosun-console

# Set your Anthropic API key (required for AI features)
export ANTHROPIC_API_KEY=sk-ant-...

# Start both services
docker compose up --build
```

This mounts your local `~/.kube/config` into the backend container for cluster access.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Health check | http://localhost:3000/api/health |

### Hot reload with Docker Compose Watch

For development with automatic file syncing:

```bash
docker compose watch
```

Changes to `frontend/src/` and `backend/app/` are synced into the running containers automatically.

## Option 2: Local Development

Run the backend and frontend separately for full control.

### Start the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The backend starts at http://localhost:8000. It uses your local kubeconfig by default.

### Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at http://localhost:3000 and proxies API requests to the backend.

## First Visit

1. Open http://localhost:3000 in your browser.
2. You should see the Kubosun shell with a sidebar, header, and dashboard.
3. The dashboard shows cluster info, node health, resource counts, and recent events.
4. Navigate to any resource type in the sidebar (Pods, Deployments, Services, etc.).
5. Open the AI chat panel and try: _"List all pods in the default namespace"_.

## Verify Everything Works

```bash
# Backend health
curl http://localhost:8000/health

# Cluster connectivity
curl http://localhost:8000/health/cluster

# Frontend health
curl http://localhost:3000/api/health
```

## Running Tests

```bash
# Frontend tests (Vitest)
cd frontend && npm test

# Backend tests (pytest)
cd backend && pytest
```

## Next Steps

- [Prerequisites](./prerequisites.md) — Full list of required tools and versions.
- [Configuration](./configuration.md) — Environment variables and OAuth setup.

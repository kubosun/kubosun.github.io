---
sidebar_position: 2
---

# Docker Deployment

Kubosun provides two Docker Compose files: one for development and one for production.

## Development: docker-compose.yml

The development compose file mounts your local kubeconfig and enables hot reload.

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - KUBOSUN_DEBUG=true
      - KUBOSUN_CORS_ORIGINS=["http://localhost:3000"]
      - KUBOSUN_ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
      - KUBOSUN_KUBECONFIG_PATH=/root/.kube/config
    volumes:
      - ${HOME}/.kube:/root/.kube:ro
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 5s
      timeout: 3s
      retries: 3
    develop:
      watch:
        - action: sync
          path: ./backend/app
          target: /app/app
```

### Usage

```bash
# Standard startup
docker compose up --build

# With hot reload (watches for file changes)
docker compose watch

# Rebuild after dependency changes
docker compose up --build --force-recreate
```

### Key Points

- The backend mounts `~/.kube` as read-only for cluster access
- `ANTHROPIC_API_KEY` is read from your shell environment
- The frontend waits for the backend health check before starting
- File sync watches `frontend/src/` and `backend/app/` for changes

## Production: docker-compose.prod.yml

The production compose file uses an env file and does not expose the backend port externally.

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    expose:
      - "8000"
    env_file:
      - ./backend/.env.local
    environment:
      - KUBOSUN_K8S_IN_CLUSTER=true
      - KUBOSUN_CORS_ORIGINS=["http://localhost:3000"]
    restart: unless-stopped
```

### Usage

```bash
# Create the env file with production values
cp backend/.env.local.example backend/.env.local
# Edit backend/.env.local with your production values

# Start in production mode
docker compose -f docker-compose.prod.yml up --build -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Key Differences from Development

| Aspect | Development | Production |
|--------|------------|------------|
| Backend port | Exposed (8000) | Internal only (`expose`) |
| Kubeconfig | Mounted from host | In-cluster ServiceAccount |
| Restart policy | None | `unless-stopped` |
| File sync | Enabled (watch) | Disabled |
| Env source | Inline + shell env | `env_file` |

## Dockerfiles

### Backend Dockerfile

The backend Dockerfile installs Python dependencies and runs uvicorn:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install -e .
COPY app/ app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

The frontend Dockerfile builds the Next.js application:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Environment Variables

Pass the `ANTHROPIC_API_KEY` from your shell:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
docker compose up --build
```

Or create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key
```

Docker Compose automatically reads `.env` files in the project root.

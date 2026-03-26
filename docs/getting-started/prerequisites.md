---
sidebar_position: 2
---

# Prerequisites

## Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 22+ | Frontend build and dev server |
| **Python** | 3.12+ | Backend runtime |
| **Docker** | 24+ | Container builds (optional for local dev) |
| **Docker Compose** | v2+ | Multi-service orchestration |

## Cluster Access

You need access to a Kubernetes or OpenShift cluster. Any of these will work:

- **Local cluster**: [kind](https://kind.sigs.k8s.io/), [minikube](https://minikube.sigs.k8s.io/), or [Podman Desktop](https://podman-desktop.io/)
- **Remote cluster**: Any Kubernetes 1.24+ or OpenShift 4.x cluster
- **Cloud**: EKS, GKE, AKS, ROSA, ARO

The backend reads your kubeconfig for development. Make sure `kubectl get nodes` works before starting Kubosun.

### CLI Tools

| Tool | Purpose |
|------|---------|
| `kubectl` | Kubernetes CLI — verify cluster access |
| `oc` | OpenShift CLI — required only for OpenShift deployments |

## API Keys

| Key | Required | Purpose |
|-----|----------|---------|
| `ANTHROPIC_API_KEY` | For AI features | Claude API access for the AI agent |

The AI chat feature requires an Anthropic API key. The rest of the console works without one.

## Recommended Development Tools

- **VS Code** or any TypeScript-aware editor
- **Claude Code CLI** — for using the project's slash commands (`/add-resource`, `/add-ai-tool`, etc.)
- **ruff** — Python linter/formatter (installed automatically with `pip install -e ".[dev]"`)

## Verify Your Setup

```bash
# Check Node.js
node --version   # Should print v22.x or higher

# Check Python
python3 --version   # Should print 3.12.x or higher

# Check Docker
docker --version
docker compose version

# Check cluster access
kubectl get nodes
```

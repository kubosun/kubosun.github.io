---
sidebar_position: 1
---

# What is Kubosun?

Kubosun Console is an **AI-native Kubernetes and OpenShift management console**. It combines a traditional resource browser with a Claude-powered AI agent that can query, diagnose, and manage your cluster through natural language.

## Vision

A Kubernetes console where:

1. **Users** manage clusters through both a traditional UI and an AI agent — ask "why is this pod crashing?" and get a real answer backed by logs, events, and metrics.
2. **Developers** extend the console by prompting Claude Code — the codebase is designed for AI-driven development with slash commands like `/add-resource` and `/add-ai-tool`.

## Key Features

- **AI-Powered Cluster Management** — Claude agent with 8 Kubernetes tools (list, get, apply, delete, logs, events, permissions, namespaces) that operate with the user's RBAC permissions.
- **Generic Resource Pages** — A registry-driven system that renders list and detail pages for any Kubernetes resource type. Adding a new resource requires only a registry entry and a nav item.
- **Real-Time Updates** — Server-Sent Events (SSE) stream resource changes from the cluster to the browser in real time.
- **Safety by Default** — All mutating AI operations use `dry_run=true` by default. The agent previews changes before applying them.
- **OAuth2/OIDC Authentication** — Native OpenShift OAuth and generic OIDC support with session-based auth and per-user token passthrough.
- **Cluster Dashboard** — Overview cards for cluster info, node health, resource counts, and recent events.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State (server) | TanStack React Query |
| State (client) | Zustand |
| Backend | Python FastAPI, kubernetes-client, Anthropic SDK |
| AI | Claude (tool use) |
| Real-time | Server-Sent Events (SSE) |
| Testing | Vitest + React Testing Library (frontend), pytest (backend) |
| Deployment | Docker, OpenShift BuildConfigs, Kustomize |

## Next Steps

- [Quick Start](./getting-started/quick-start.md) — Get Kubosun running locally in minutes.
- [Architecture Overview](./architecture/overview.md) — Understand the three-layer design.
- [Developer Guide](./developer-guide/claude-skills.md) — Learn the slash commands for extending the console.

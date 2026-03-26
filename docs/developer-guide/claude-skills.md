---
sidebar_position: 1
---

# Claude Code Slash Commands

Kubosun Console is designed for AI-driven development. The project includes 6 Claude Code slash commands (skills) in `.claude/commands/` that automate common development tasks.

To use these commands, you need the [Claude Code CLI](https://claude.com/claude-code) installed.

## /add-resource

**Add a Kubernetes resource page to the console.**

Prompts you for the resource Kind, API group, version, plural name, nav section, and key columns. Then it:

1. Adds an entry to `RESOURCE_REGISTRY` in `frontend/src/lib/k8s/resource-registry.ts`
2. Adds a nav item to the appropriate section in `AppShell.tsx`
3. Runs `npm run type-check` to verify
4. Commits the change

**Example:**

```
/add-resource
> Kind: DaemonSet
> API group: apps
> Version: v1
> Plural: daemonsets
> Nav section: Workloads
> Columns: Ready, Node Selector, Age
```

The generic list and detail pages automatically work for any resource in the registry.

## /add-api-endpoint

**Create a new backend API endpoint.**

Prompts for domain name, route prefix, and endpoint definitions. Then it:

1. Creates `backend/app/routers/\{domain\}.py` with async handlers and Pydantic models
2. Registers the router in `backend/app/main.py`
3. Creates `backend/tests/test_\{domain\}.py`
4. Adds a rewrite rule in `frontend/next.config.ts`
5. Runs `ruff check` and `pytest`
6. Commits the change

## /add-ai-tool

**Add a new AI agent tool.**

Prompts for tool name, description, parameters, and return type. Then it:

1. Adds the tool definition to `K8S_TOOLS` in `backend/app/services/ai_tools.py`
2. Adds a dispatch entry in `_dispatch_tool()`
3. Implements the handler function
4. Runs `ruff check` and `pytest`
5. Commits the change

Mutating tools always get `dry_run=True` as the default parameter value.

## /deploy

**Build and deploy to OpenShift.**

Executes the full deployment pipeline:

1. Checks for uncommitted changes
2. Pushes to GitHub
3. Triggers OpenShift BuildConfigs (`kubosun-backend`, `kubosun-frontend`)
4. Waits for builds to complete
5. Restarts deployments
6. Verifies the Route responds

Key resources: namespace `kubosun`, BuildConfigs, Deployments, Route, Secret.

## /check

**Run all lint, type-check, and test suites.**

Runs in parallel:

**Backend:**
```bash
ruff check . && ruff format --check . && pytest -q
```

**Frontend:**
```bash
npm run type-check && npm run lint && npm test
```

Reports results as a pass/fail table:

| Check | Status |
|-------|--------|
| Backend lint (ruff) | Pass/Fail |
| Backend format | Pass/Fail |
| Backend tests (pytest) | Pass/Fail |
| Frontend types (tsc) | Pass/Fail |
| Frontend lint (eslint) | Pass/Fail |
| Frontend tests (vitest) | Pass/Fail |

## /add-dashboard-card

**Add a new card to the cluster overview dashboard.**

Prompts for card name, data to display, and data source. Then it:

1. Creates `frontend/src/components/dashboard/{Name}Card.tsx`
2. Adds the card to the dashboard layout in `frontend/src/app/(console)/page.tsx`
3. Creates a new hook or updates the backend if new data is needed
4. Runs `npm run type-check`
5. Commits the change

Cards follow the existing patterns in `src/components/dashboard/` (ClusterInfoCard, NodeHealthCard, ResourceCountCard, RecentEventsCard).

---
sidebar_position: 2
---

# Frontend Architecture

The frontend is a Next.js 15 application using the App Router, TypeScript (strict mode), Tailwind CSS, and shadcn/ui components.

## Directory Structure

```
frontend/src/
├── app/                          # Next.js App Router (file-based routing)
│   ├── (console)/                # Route group for authenticated layout
│   │   ├── layout.tsx            # App shell (sidebar, header, content area)
│   │   ├── page.tsx              # Dashboard (cluster overview)
│   │   └── resources/            # Dynamic resource pages
│   │       └── [group]/[version]/[plural]/
│   │           ├── page.tsx      # Resource list page
│   │           └── [name]/
│   │               └── page.tsx  # Resource detail page
│   ├── api/health/route.ts       # Frontend health check
│   ├── layout.tsx                # Root layout (providers)
│   └── globals.css               # Tailwind base styles
├── components/
│   ├── shell/                    # AppShell, NamespaceSelector
│   ├── resources/                # ResourceListPage, ResourceDetailPage, DataTable
│   ├── dashboard/                # ClusterInfoCard, NodeHealthCard, etc.
│   ├── providers/                # AuthGuard, QueryProvider
│   ├── ai/                       # ChatPanel
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
├── lib/
│   └── k8s/                      # K8s client, types, resource registry
├── stores/                       # Zustand stores
└── config/                       # YAML config files (navigation, models)
```

## File-Based Routing

Next.js App Router maps the filesystem to routes. The `(console)` route group wraps all authenticated pages in the app shell layout.

### Dynamic Resource Routes

All Kubernetes resources use a single set of dynamic route segments:

```
/resources/[group]/[version]/[plural]         → list page
/resources/[group]/[version]/[plural]/[name]  → detail page
```

For example:
- `/resources/core/v1/pods` lists Pods
- `/resources/apps/v1/deployments/my-app` shows Deployment details

Core API resources use `core` as the group slug (mapped from empty string).

## Resource Registry

The `RESOURCE_REGISTRY` in `src/lib/k8s/resource-registry.ts` is a `Map<string, ResourceTypeConfig>` that defines how each resource type is displayed:

```typescript
interface ResourceTypeConfig {
  group: string;          // API group ("" for core, "apps", etc.)
  version: string;        // API version
  plural: string;         // Plural name for API paths
  kind: string;           // Kind name (Pod, Deployment, etc.)
  label: string;          // Singular display name
  labelPlural: string;    // Plural display name
  namespaced: boolean;    // Whether the resource is namespaced
  icon: LucideIcon;       // Sidebar and header icon
  columns: ColumnDef[];   // Table column definitions
}
```

Currently registered resources: Pods, Deployments, Services, ConfigMaps, Secrets, Nodes, Namespaces.

Resources not in the registry still work -- the generic pages fall back to `DEFAULT_COLUMNS` (Name, Namespace, Age) via `getDefaultConfig()`.

## State Management

### Server State: React Query

TanStack React Query manages all data fetched from the backend:

- **`useK8sResource`** — Fetches a single resource with polling (default 10s refetch interval)
- **`useK8sResourceList`** — Fetches a resource list with SSE watch for real-time updates
- **`useClusterSummary`** — Fetches the aggregated cluster summary for the dashboard
- **`useAccessReview`** — Checks RBAC permissions via SelfSubjectAccessReview
- **`useUser`** — Fetches current user info from the session

### Client State: Zustand

Zustand stores hold UI-only state that persists across navigation:

- **`namespace-store`** — Selected namespace (used as context for resource queries and AI chat)

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useK8sResource({ group, version, plural, name, namespace })` | Fetch a single K8s resource |
| `useK8sResourceList({ group, version, plural, namespace })` | Fetch and watch a resource list |
| `useAccessReview({ verb, resource, namespace })` | RBAC permission check |
| `useAIAgent(namespace)` | AI chat with streaming SSE |
| `useClusterSummary()` | Cluster overview data |
| `useUser()` | Current authenticated user |

## Component Patterns

### Generic Resource Pages

`ResourceListPage` and `ResourceDetailPage` are generic components that work with any resource type. They read the `[group]`, `[version]`, `[plural]` route params, look up the config from `RESOURCE_REGISTRY`, and render accordingly.

### Dashboard Cards

Dashboard cards live in `src/components/dashboard/` and receive data from the `useClusterSummary()` hook. Current cards: `ClusterInfoCard`, `NodeHealthCard`, `ResourceCountCard`, `RecentEventsCard`.

### AI Chat Panel

The `ChatPanel` component uses the `useAIAgent` hook to stream messages. It displays tool calls and results inline as the agent works through a request.

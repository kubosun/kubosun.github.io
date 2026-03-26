---
sidebar_position: 2
---

# Adding Resource Pages

Kubosun uses a registry-driven system for resource pages. Adding a new Kubernetes resource type to the console requires two changes: a registry entry and a navigation item. No new page components are needed.

## How Generic Pages Work

The frontend has dynamic route segments at:

```
src/app/(console)/resources/[group]/[version]/[plural]/page.tsx      → list
src/app/(console)/resources/[group]/[version]/[plural]/[name]/page.tsx → detail
```

These pages:

1. Read the `group`, `version`, and `plural` route params
2. Look up the resource config from `RESOURCE_REGISTRY`
3. If found, use the config's columns, icon, and labels
4. If not found, fall back to `getDefaultConfig()` with Name, Namespace, and Age columns
5. Fetch data via `useK8sResourceList` or `useK8sResource`

This means **any** Kubernetes resource type works automatically if you know the URL. The registry just improves the experience with custom columns and icons.

## Step 1: Add a Registry Entry

Edit `frontend/src/lib/k8s/resource-registry.ts` and add a new entry to the `RESOURCE_REGISTRY` map:

```typescript
import { Layers } from 'lucide-react'; // Add icon import if needed

// Add to RESOURCE_REGISTRY map:
[
  'apps/v1/statefulsets',
  {
    group: 'apps',
    version: 'v1',
    plural: 'statefulsets',
    kind: 'StatefulSet',
    label: 'StatefulSet',
    labelPlural: 'StatefulSets',
    namespaced: true,
    icon: Layers,
    columns: [
      { id: 'name', header: 'Name', accessor: (r) => r.metadata.name, sortable: true },
      { id: 'namespace', header: 'Namespace', accessor: (r) => r.metadata.namespace ?? '-', sortable: true },
      { id: 'ready', header: 'Ready', accessor: (r) => {
        const ready = (r.status?.readyReplicas as number) ?? 0;
        const desired = (r.spec?.replicas as number) ?? 0;
        return `${ready}/${desired}`;
      }},
      { id: 'age', header: 'Age', accessor: (r) => formatAge(r.metadata.creationTimestamp), sortable: true },
    ],
  },
],
```

### Registry Key Format

The map key is `\{groupSlug\}/\{version\}/\{plural\}`:

- Core API resources (pods, services, configmaps): use `core` as the group slug
- Other resources: use the API group (e.g., `apps`, `networking.k8s.io`)

### Column Definitions

Each column has:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique column identifier |
| `header` | `string` | Column header text |
| `accessor` | `(r: K8sResource) => string` | Function that extracts the display value |
| `sortable` | `boolean` | Whether the column is sortable (optional) |

The accessor receives the full Kubernetes resource object and must return a string.

## Step 2: Add a Navigation Item

Edit `frontend/src/components/shell/AppShell.tsx` and add a nav item to the appropriate section in `NAV_SECTIONS`:

```typescript
{
  label: 'StatefulSets',
  href: '/resources/apps/v1/statefulsets',
  icon: Layers,
},
```

### URL Format

The href follows the pattern `/resources/\{groupSlug\}/\{version\}/\{plural\}`:

- Core resources: `/resources/core/v1/pods`
- Apps resources: `/resources/apps/v1/deployments`
- Networking: `/resources/networking.k8s.io/v1/ingresses`

### Nav Sections

Resources are organized into sections:

- **Cluster** — Nodes, Namespaces
- **Workloads** — Pods, Deployments, StatefulSets, DaemonSets, Jobs
- **Networking** — Services, Ingresses, NetworkPolicies
- **Configuration** — ConfigMaps, Secrets
- **Storage** — PersistentVolumeClaims, StorageClasses

## Step 3: Verify

```bash
cd frontend && npm run type-check
```

## Using the Slash Command

Instead of doing this manually, use the `/add-resource` slash command in Claude Code:

```
/add-resource
```

It will prompt you for all the details and make both changes automatically.

---
sidebar_position: 2
---

# AI Tools Reference

The AI agent has 8 Kubernetes tools defined in the `K8S_TOOLS` array in `backend/app/services/ai_tools.py`. Claude decides which tools to call based on the user's message and each tool's description.

## list_resources

List Kubernetes resources of a given type.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_path` | string | Yes | K8s API path (e.g., `api/v1/pods`, `apis/apps/v1/namespaces/default/deployments`) |

**Example input:**

```json
{
  "api_path": "api/v1/namespaces/default/pods"
}
```

**Example output:**

```json
{
  "count": 3,
  "items": [
    {
      "name": "nginx-abc123",
      "namespace": "default",
      "status": "Running",
      "age": "2024-03-20T10:30:00Z"
    },
    {
      "name": "redis-def456",
      "namespace": "default",
      "status": "Running",
      "age": "2024-03-19T08:00:00Z"
    }
  ]
}
```

## get_resource

Get a specific Kubernetes resource by API path. Returns the full resource object.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_path` | string | Yes | Full K8s API path (e.g., `api/v1/namespaces/default/pods/my-pod`) |

**Example input:**

```json
{
  "api_path": "apis/apps/v1/namespaces/default/deployments/nginx"
}
```

**Example output:**

```json
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "nginx",
    "namespace": "default"
  },
  "spec": {
    "replicas": 3
  },
  "status": {
    "readyReplicas": 3,
    "availableReplicas": 3
  }
}
```

## get_pod_logs

Get logs from a pod container.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Pod name |
| `namespace` | string | Yes | Namespace |
| `container` | string | No | Container name (defaults to first container) |
| `tail_lines` | integer | No | Number of lines from the end (default 100) |

**Example input:**

```json
{
  "name": "nginx-abc123",
  "namespace": "default",
  "tail_lines": 20
}
```

**Example output:**

```json
{
  "logs": "2024-03-26 10:00:01 [info] GET /health 200\n2024-03-26 10:00:06 [info] GET /health 200\n..."
}
```

## apply_resource

Create or update a Kubernetes resource. Uses dry-run by default for safety.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `manifest` | object | Yes | The Kubernetes resource manifest as JSON |
| `dry_run` | boolean | No | If true (default), validate without applying |

**Example input (dry run):**

```json
{
  "manifest": {
    "apiVersion": "v1",
    "kind": "ConfigMap",
    "metadata": {
      "name": "my-config",
      "namespace": "default"
    },
    "data": {
      "key": "value"
    }
  },
  "dry_run": true
}
```

**Example output (dry run):**

```json
{
  "action": "would create (dry-run)",
  "kind": "ConfigMap",
  "name": "my-config",
  "namespace": "default",
  "result": "validated successfully"
}
```

**Example output (actual apply):**

```json
{
  "action": "created",
  "kind": "ConfigMap",
  "name": "my-config",
  "namespace": "default",
  "result": { "apiVersion": "v1", "kind": "ConfigMap", "..." : "..." }
}
```

## delete_resource

Delete a Kubernetes resource. Uses dry-run by default for safety.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_path` | string | Yes | Full API path (e.g., `api/v1/namespaces/default/pods/my-pod`) |
| `dry_run` | boolean | No | If true (default), preview without deleting |

**Example input:**

```json
{
  "api_path": "api/v1/namespaces/default/pods/old-pod",
  "dry_run": true
}
```

**Example output:**

```json
{
  "action": "would delete (dry-run)",
  "path": "api/v1/namespaces/default/pods/old-pod"
}
```

## get_events

Get Kubernetes events for a namespace, optionally filtered by involved object.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `namespace` | string | Yes | Namespace |
| `involved_object` | string | No | Filter by involved object name |
| `limit` | integer | No | Max events to return (default 20) |

**Example input:**

```json
{
  "namespace": "default",
  "involved_object": "nginx-abc123",
  "limit": 5
}
```

**Example output:**

```json
{
  "count": 2,
  "events": [
    {
      "type": "Normal",
      "reason": "Scheduled",
      "message": "Successfully assigned default/nginx-abc123 to node-1",
      "object": "Pod/nginx-abc123",
      "first_seen": "2024-03-26T10:00:00Z",
      "last_seen": "2024-03-26T10:00:00Z",
      "count": 1
    },
    {
      "type": "Normal",
      "reason": "Started",
      "message": "Started container nginx",
      "object": "Pod/nginx-abc123",
      "first_seen": "2024-03-26T10:00:05Z",
      "last_seen": "2024-03-26T10:00:05Z",
      "count": 1
    }
  ]
}
```

## check_permissions

Check if the current user can perform an action on a resource using SelfSubjectAccessReview.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verb` | string (enum) | Yes | One of: `get`, `list`, `create`, `update`, `delete`, `watch`, `patch` |
| `resource` | string | Yes | Resource type (e.g., `pods`, `deployments`) |
| `group` | string | No | API group (empty for core, e.g., `apps`) |
| `namespace` | string | No | Namespace (omit for cluster-scoped check) |

**Example input:**

```json
{
  "verb": "delete",
  "resource": "deployments",
  "group": "apps",
  "namespace": "production"
}
```

**Example output:**

```json
{
  "allowed": false,
  "verb": "delete",
  "resource": "deployments",
  "namespace": "production"
}
```

## list_namespaces

List all namespaces on the cluster. Takes no parameters.

**Parameters:** None

**Example input:**

```json
{}
```

**Example output:**

```json
{
  "namespaces": [
    {
      "name": "default",
      "status": "Active",
      "labels": {
        "kubernetes.io/metadata.name": "default"
      }
    },
    {
      "name": "kube-system",
      "status": "Active",
      "labels": {
        "kubernetes.io/metadata.name": "kube-system"
      }
    }
  ]
}
```

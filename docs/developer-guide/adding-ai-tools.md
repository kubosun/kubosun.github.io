---
sidebar_position: 4
---

# Adding AI Tools

The AI agent's capabilities are defined by the `K8S_TOOLS` array in `backend/app/services/ai_tools.py`. Each tool is a function that Claude can call to interact with the Kubernetes cluster.

## Step 1: Define the Tool

Add a new entry to the `K8S_TOOLS` list:

```python
{
    "name": "scale_deployment",
    "description": "Scale a Deployment to a specified number of replicas.",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Deployment name"},
            "namespace": {"type": "string", "description": "Namespace"},
            "replicas": {"type": "integer", "description": "Target replica count"},
            "dry_run": {
                "type": "boolean",
                "description": "If true (default), preview without applying",
                "default": True,
            },
        },
        "required": ["name", "namespace", "replicas"],
    },
},
```

### Tool Definition Fields

| Field | Description |
|-------|-------------|
| `name` | Snake-case identifier. Claude uses this to call the tool. |
| `description` | What the tool does. Claude reads this to decide when to use it. Write clear, specific descriptions. |
| `input_schema` | JSON Schema for parameters. Include descriptions for each property. |

## Step 2: Add Dispatch Entry

In the `_dispatch_tool()` function, add a branch for your new tool:

```python
elif tool_name == "scale_deployment":
    return await _scale_deployment(
        tool_input["name"],
        tool_input["namespace"],
        tool_input["replicas"],
        tool_input.get("dry_run", True),
        client,
    )
```

## Step 3: Implement the Handler

Add the implementation function:

```python
async def _scale_deployment(
    name: str,
    namespace: str,
    replicas: int,
    dry_run: bool = True,
    api_client: ApiClient | None = None,
) -> dict:
    api_client = api_client or get_api_client()
    body = {"spec": {"replicas": replicas}}
    query_params = [("dryRun", "All")] if dry_run else []

    api_client.call_api(
        f"/apis/apps/v1/namespaces/\{namespace\}/deployments/\{name\}/scale",
        "PATCH",
        query_params=query_params,
        body=body,
        response_type="object",
        auth_settings=["BearerToken"],
        header_params={"Content-Type": "application/strategic-merge-patch+json"},
    )

    action = "would scale (dry-run)" if dry_run else "scaled"
    return {
        "action": action,
        "deployment": name,
        "namespace": namespace,
        "replicas": replicas,
    }
```

### Handler Conventions

- Accept `api_client: ApiClient | None = None` as the last parameter
- Default to `get_api_client()` if no client is provided
- For mutating operations, always accept `dry_run: bool = True`
- Return a dict with clear field names
- Use the `api_client` passed from `_dispatch_tool()` to respect user RBAC

## Dry-Run Convention

All mutating tools must follow the dry-run pattern:

1. The `dry_run` parameter defaults to `True` in the tool schema
2. The handler passes `dryRun=All` as a query parameter to the K8s API
3. The system prompt instructs Claude to always dry-run first and ask for confirmation
4. Only after user confirmation does Claude call the tool with `dry_run=false`

## Step 4: Verify

```bash
cd backend && ruff check . && pytest
```

## Using the Slash Command

Instead of doing this manually, use the `/add-ai-tool` slash command in Claude Code:

```
/add-ai-tool
```

It will prompt for the tool name, description, parameters, and return type, then make all three changes (definition, dispatch, handler) automatically.

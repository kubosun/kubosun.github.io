---
sidebar_position: 4
---

# AI Agent Architecture

Kubosun includes a Claude-powered AI agent that can interact with the Kubernetes cluster through natural language. The agent uses Claude's tool-use capability to call 8 Kubernetes operations.

## How It Works

The AI agent follows the **Claude tool-use pattern**:

```
1. User sends a message ("list all crashing pods")
2. Backend sends message + K8S_TOOLS definitions to Claude API
3. Claude decides which tools to call (e.g., list_resources, get_events)
4. Backend executes each tool against the K8s API using the user's token
5. Tool results are sent back to Claude
6. Claude may call more tools or produce a final text response
7. Steps 3-6 repeat until Claude has all the information it needs
8. Final text response is streamed to the browser via SSE
```

## Tool-Use Loop

The `/api/ai/chat` endpoint implements an iterative tool-use loop:

```python
while True:
    response = client.messages.create(
        model=settings.ai_model,
        system=system_prompt,
        messages=current_messages,
        tools=K8S_TOOLS,
        max_tokens=4096,
    )

    # Process response blocks
    for block in response.content:
        if block.type == "text":
            # Stream text to frontend via SSE
        elif block.type == "tool_use":
            # Execute tool, collect result

    if no tool calls:
        break  # Done — final text response produced

    # Append tool results and continue the loop
```

This loop continues until Claude produces a response with no tool calls, meaning it has gathered enough information to answer the user.

## Streaming SSE

The chat endpoint returns a `StreamingResponse` with `text/event-stream` media type. Each SSE frame is a JSON object with one of three types:

| Type | Payload | Description |
|------|---------|-------------|
| `text` | `{ "type": "text", "content": "..." }` | Text from Claude (may arrive in multiple frames) |
| `tool_call` | `{ "type": "tool_call", "tool": "list_resources", "input": {...} }` | Claude is calling a tool |
| `tool_result` | `{ "type": "tool_result", "tool": "list_resources", "result": "..." }` | Result of the tool execution |
| `done` | `{ "type": "done" }` | Conversation turn complete |

The frontend `useAIAgent` hook consumes these SSE frames and updates the UI incrementally.

## K8S_TOOLS Array

The `K8S_TOOLS` array in `backend/app/services/ai_tools.py` defines the tools available to Claude. Each tool has:

- `name` — Snake-case identifier
- `description` — What the tool does (Claude reads this to decide when to use it)
- `input_schema` — JSON Schema for the tool's parameters

There are currently 8 tools. See the [AI Tools Reference](../api-reference/ai-tools.md) for the full list.

## Dry-Run Safety

Mutating tools (`apply_resource`, `delete_resource`) default to `dry_run=true`. This means:

1. Claude first calls the tool with `dry_run=true` to validate and preview the change.
2. Claude reports what would happen to the user.
3. Only after the user explicitly confirms does Claude call the tool again with `dry_run=false`.

The system prompt reinforces this behavior:

> For destructive actions (delete, apply), always use dry_run=true first and show what would happen. Only proceed with actual changes after the user explicitly confirms.

## User Token Passthrough

The AI agent executes tools using the **user's own Kubernetes token**, not a shared ServiceAccount. This ensures:

- RBAC is enforced per user — the agent can only do what the user is allowed to do
- Audit logs correctly attribute actions to the user
- No privilege escalation is possible through the AI

The token flow:

```
1. AuthMiddleware extracts user token from session cookie
2. Token stored in request.state.user_token
3. /api/ai/chat reads user_token from request state
4. execute_tool() receives user_token parameter
5. _get_client(user_token) creates a K8s API client with that token
6. All K8s API calls use the user's credentials
```

## System Prompt

The system prompt provides Claude with:

- Its identity ("You are Kubosun, an AI assistant for Kubernetes cluster management")
- Guidelines for tool use and safety
- API path format examples for core, apps, and networking resources
- The current namespace context (appended dynamically from the request)

## Frontend Integration

The `useAIAgent` hook in the frontend:

1. Maintains conversation history (`messages` state)
2. Sends POST to `/api/ai/chat` with messages and namespace
3. Reads SSE stream using `ReadableStream` API
4. Parses each `data:` frame and updates state:
   - `text` frames accumulate into the assistant message
   - `tool_call` frames are displayed as activity indicators
   - `tool_result` frames update the tool call with results
5. Exposes `{ messages, sendMessage, isLoading, toolCalls, clearChat }`

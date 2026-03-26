---
sidebar_position: 5
---

# Testing

Kubosun uses Vitest with React Testing Library for the frontend and pytest for the backend. Ruff handles Python linting and formatting.

## Frontend Testing

### Framework

- **Vitest** — Test runner (Jest-compatible API)
- **React Testing Library (RTL)** — Component testing with user-centric queries
- **Setup file** — `frontend/src/test-setup.ts`

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests for a specific file
npm test -- src/components/shell/AppShell.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test File Conventions

- Tests are co-located with source files: `Component.tsx` next to `Component.test.tsx`
- Test files use the `.test.tsx` or `.test.ts` extension
- Mirror the component structure in test structure

### Writing Frontend Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the sidebar navigation', () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

### Mocking Hooks

For components that use custom hooks (e.g., `useK8sResourceList`, `useAIAgent`), mock them at the module level:

```typescript
import { vi } from 'vitest';

vi.mock('@/hooks/useK8sResourceList', () => ({
  useK8sResourceList: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));
```

### Type Checking

TypeScript type checking is a separate step from tests:

```bash
cd frontend && npm run type-check
```

### Linting

ESLint with the project config:

```bash
cd frontend && npm run lint
```

## Backend Testing

### Framework

- **pytest** — Test runner
- **TestClient** — FastAPI test client for HTTP testing

### Running Tests

```bash
cd backend

# Run all tests
pytest

# Run a specific test file
pytest tests/test_health.py

# Run with verbose output
pytest -v

# Run quietly (summary only)
pytest -q
```

### Test File Conventions

- Tests live in `backend/tests/`
- Test files mirror the app structure: `test_health.py` for `app/routers/health.py`
- Test function names start with `test_`

### Writing Backend Tests

```python
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "kubosun-backend"


def test_health_has_timestamp():
    response = client.get("/health")
    data = response.json()
    assert "timestamp" in data
```

### Linting and Formatting

Ruff handles both linting and formatting for Python:

```bash
cd backend

# Lint check
ruff check .

# Format check (no changes)
ruff format --check .

# Auto-fix lint issues
ruff check --fix .

# Auto-format
ruff format .
```

## Running All Checks

Use the `/check` slash command in Claude Code to run all checks in parallel:

```
/check
```

Or run manually:

```bash
# Backend
cd backend && ruff check . && ruff format --check . && pytest -q

# Frontend
cd frontend && npm run type-check && npm run lint && npm test
```

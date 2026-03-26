---
sidebar_position: 1
---

# Kubosun CLI

The `kubosun` CLI deploys and manages Kubosun Console on any OpenShift cluster. It uses your existing `oc login` session — no credentials are stored or exposed.

## Install

```bash
# From the kubosun-console repo
pip install -e cli/

# Or with pipx (isolated install)
pipx install ./cli
```

## Prerequisites

- **oc CLI** installed ([download](https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/))
- **Python 3.10+**
- **Cluster-admin** permissions on the target cluster
- **Anthropic API key** for the AI agent ([get one](https://console.anthropic.com/settings/keys))

## Commands

### `kubosun setup` — First-Time Deployment

Sets up everything on a fresh OpenShift cluster:

```bash
# Login to your cluster first
oc login https://api.your-cluster.example.com --username admin

# Run setup (prompts for Anthropic API key)
kubosun setup
```

**What it creates:**

| Resource | Purpose |
|----------|---------|
| Namespace | `kubosun` project |
| OAuthClient | OpenShift OAuth integration |
| Secret | API keys, session secret, OAuth config |
| ImageStreams | Container image references |
| BuildConfigs | Build from GitHub repo |
| Deployments | Backend + frontend pods |
| Services | Internal networking |
| Route | HTTPS endpoint with TLS |
| RBAC | cluster-reader for ServiceAccount |

**Options:**

```bash
kubosun setup \
  --namespace my-kubosun \          # Custom namespace (default: kubosun)
  --anthropic-key sk-ant-... \      # Skip prompt, pass directly
  --repo-url https://github.com/my-fork/console.git  # Custom repo
```

The setup is **idempotent** — you can re-run it safely to update an existing deployment.

### `kubosun deploy` — Push Updates

After pushing code changes to GitHub:

```bash
kubosun deploy
```

This:
1. Triggers backend and frontend builds on OpenShift
2. Waits for builds to complete (with progress spinner)
3. Restarts deployments with new images
4. Waits for rollout to finish
5. Prints the console URL

**Options:**

```bash
kubosun deploy --namespace my-kubosun
```

### `kubosun status` — Check Deployment

```bash
kubosun status
```

Shows:
- **URL** — the console route
- **Pods** — name, status, readiness, restart count
- **Health** — HTTP health check result

Example output:

```
Logged in as cluster-admin

URL: https://kubosun-kubosun.apps.your-cluster.example.com

         Pods
┌──────────────────────────┬─────────┬───────┬──────────┐
│ Name                     │ Status  │ Ready │ Restarts │
├──────────────────────────┼─────────┼───────┼──────────┤
│ kubosun-backend-7f8b..   │ Running │ Yes   │ 0        │
│ kubosun-frontend-9c4d..  │ Running │ Yes   │ 0        │
└──────────────────────────┴─────────┴───────┴──────────┘

Health check passed (HTTP 200)
```

## Typical Workflow

```bash
# 1. First time: login and setup
oc login https://api.cluster.example.com --username admin
kubosun setup

# 2. Make code changes, push to GitHub
git add -A && git commit -m "Add feature" && git push

# 3. Deploy the changes
kubosun deploy

# 4. Verify
kubosun status
```

## Deploying to Multiple Clusters

Use different namespaces or switch oc contexts:

```bash
# Cluster A
oc login https://api.cluster-a.example.com
kubosun setup --namespace kubosun-staging

# Cluster B
oc login https://api.cluster-b.example.com
kubosun setup --namespace kubosun-prod
```

## Troubleshooting

### "Not logged in" error

Run `oc login` first:

```bash
oc login https://api.your-cluster.example.com --username admin
```

### Build failed

Check the build logs:

```bash
oc logs -f build/kubosun-frontend-1 -n kubosun
oc logs -f build/kubosun-backend-1 -n kubosun
```

### Pods not starting

Check pod events:

```bash
oc describe pod -l app=kubosun-backend -n kubosun
oc describe pod -l app=kubosun-frontend -n kubosun
```

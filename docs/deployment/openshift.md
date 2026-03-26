---
sidebar_position: 2
---

# Deploying to OpenShift (Manual)

:::tip Recommended
Use the [Kubosun CLI](./cli) for automated deployment: `kubosun setup`
:::

This page documents the manual deployment process. Kubosun Console deploys to OpenShift using BuildConfigs, ImageStreams, and a Route. The backend uses OpenShift OAuth for authentication.

## Prerequisites

- OpenShift 4.x cluster with `oc` CLI configured
- Cluster admin access (for OAuthClient creation)
- GitHub repository accessible from the cluster (for BuildConfigs)

## Namespace Setup

```bash
oc new-project kubosun
```

## Step 1: Create the OAuthClient

The OAuthClient allows Kubosun to authenticate users via OpenShift's built-in OAuth server.

```yaml
apiVersion: oauth.openshift.io/v1
kind: OAuthClient
metadata:
  name: kubosun-console
grantMethod: auto
secret: <generate-a-strong-secret>
redirectURIs:
  - https://kubosun.apps.cluster.example.com/auth/callback
```

```bash
oc apply -f oauthclient.yaml
```

## Step 2: Create the Secret

Store sensitive configuration values in a Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kubosun-secrets
  namespace: kubosun
type: Opaque
stringData:
  KUBOSUN_ANTHROPIC_API_KEY: "sk-ant-your-key"
  KUBOSUN_SESSION_SECRET: "<random-32-char-string>"
  KUBOSUN_OAUTH_CLIENT_ID: "kubosun-console"
  KUBOSUN_OAUTH_CLIENT_SECRET: "<same-secret-as-oauthclient>"
  KUBOSUN_OAUTH_ISSUER_URL: "https://api.cluster.example.com:6443"
  KUBOSUN_OAUTH_REDIRECT_URI: "https://kubosun.apps.cluster.example.com/auth/callback"
```

```bash
oc apply -f secret.yaml -n kubosun
```

## Step 3: Create the ServiceAccount

The backend needs a ServiceAccount for in-cluster K8s API access:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kubosun
  namespace: kubosun
```

```bash
oc apply -f serviceaccount.yaml -n kubosun
```

Grant cluster-reader permissions (adjust based on your needs):

```bash
oc adm policy add-cluster-role-to-user cluster-reader -z kubosun -n kubosun
```

## Step 4: Create BuildConfigs

### Backend BuildConfig

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: kubosun-backend
  namespace: kubosun
spec:
  source:
    type: Git
    git:
      uri: https://github.com/kubosun/kubosun-console.git
    contextDir: backend
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
  output:
    to:
      kind: ImageStreamTag
      name: kubosun-backend:latest
  triggers:
    - type: ConfigChange
```

### Frontend BuildConfig

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: kubosun-frontend
  namespace: kubosun
spec:
  source:
    type: Git
    git:
      uri: https://github.com/kubosun/kubosun-console.git
    contextDir: frontend
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
  output:
    to:
      kind: ImageStreamTag
      name: kubosun-frontend:latest
  triggers:
    - type: ConfigChange
```

### ImageStreams

```bash
oc create imagestream kubosun-backend -n kubosun
oc create imagestream kubosun-frontend -n kubosun
```

## Step 5: Create Deployments

The backend Deployment uses the ServiceAccount and references the Secret:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kubosun-backend
  namespace: kubosun
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: kubosun
      app.kubernetes.io/component: backend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: kubosun
        app.kubernetes.io/component: backend
    spec:
      serviceAccountName: kubosun
      containers:
        - name: backend
          image: kubosun-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: KUBOSUN_K8S_IN_CLUSTER
              value: "true"
            - name: KUBOSUN_OAUTH_ENABLED
              value: "true"
            - name: KUBOSUN_OAUTH_PROVIDER
              value: "openshift"
          envFrom:
            - secretRef:
                name: kubosun-secrets
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
```

The frontend Deployment connects to the backend service:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kubosun-frontend
  namespace: kubosun
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: kubosun
      app.kubernetes.io/component: frontend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: kubosun
        app.kubernetes.io/component: frontend
    spec:
      containers:
        - name: frontend
          image: kubosun-frontend:latest
          ports:
            - containerPort: 3000
          env:
            - name: BACKEND_URL
              value: "http://kubosun-backend:8000"
```

## Step 6: Create Services and Route

```bash
oc expose deployment kubosun-backend --port=8000 -n kubosun
oc expose deployment kubosun-frontend --port=3000 -n kubosun
oc create route edge kubosun --service=kubosun-frontend --port=3000 -n kubosun
```

## Step 7: Build and Deploy

```bash
# Trigger builds
oc start-build kubosun-backend -n kubosun
oc start-build kubosun-frontend -n kubosun

# Watch build progress
oc logs -f bc/kubosun-backend -n kubosun
oc logs -f bc/kubosun-frontend -n kubosun

# After builds complete, verify pods
oc get pods -n kubosun

# Get the route URL
oc get route kubosun -n kubosun -o jsonpath='{.spec.host}'
```

## Redeploying

Use the `/deploy` slash command in Claude Code for automated redeployment:

```
/deploy
```

Or manually:

```bash
oc start-build kubosun-backend kubosun-frontend -n kubosun
# Wait for builds to complete, then:
oc rollout restart deployment kubosun-backend kubosun-frontend -n kubosun
```

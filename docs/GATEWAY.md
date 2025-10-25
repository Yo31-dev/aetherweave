# Gateway & API Routing Strategy

This document explains how AetherWeave manages API Gateway routing with APISIX across different environments and deployment scenarios.

## Table of Contents

- [Overview](#overview)
- [APISIX Deployment Modes](#apisix-deployment-modes)
- [Development Strategy (Mono-Repo)](#development-strategy-mono-repo)
- [Production Strategy (Multi-Repo)](#production-strategy-multi-repo)
- [Route Configuration Examples](#route-configuration-examples)
- [Deployment Workflows](#deployment-workflows)
- [Best Practices](#best-practices)

---

## Overview

AetherWeave uses **Apache APISIX** as its API Gateway with two distinct strategies:

| Environment | Mode | Config Location | Deployment Method | Use Case |
|------------|------|-----------------|-------------------|----------|
| **Development** | Standalone | `infrastructure/apisix/apisix.yaml` | ADC declarative sync | Local dev, all services in one repo |
| **Production** | Traditional | `services/*/gateway/routes/*.json` | Admin API (REST) | Production, each service in own repo |

**Why two approaches?**

- **Dev (Standalone)**: Simple, fast, declarative configuration in one file for rapid local development
- **Prod (Traditional)**: Scalable, independent service deployments without cross-repo dependencies

---

## APISIX Deployment Modes

### Standalone Mode (Development)

**Characteristics:**
- Configuration stored in local `apisix.yaml` file
- Uses ADC (APISIX Declarative CLI) for synchronization
- **Full replacement**: Running `adc sync` replaces ALL routes
- No etcd dependency for route storage
- Requires all service configurations to be present in one file

**Pros:**
- ✅ Simple setup for local development
- ✅ Fast iteration
- ✅ Git-friendly (YAML in version control)
- ✅ No external dependencies

**Cons:**
- ❌ Not suitable for multi-repo architectures
- ❌ Cannot deploy individual services independently
- ❌ Full sync required even for single route change

**When to use:** Local development, staging environments, mono-repo setups

### Traditional Mode (Production)

**Characteristics:**
- Configuration stored in **etcd**
- Routes managed via **Admin API** (REST endpoints)
- **Incremental updates**: Create/update individual routes without affecting others
- Hot-reloading without gateway restart
- No file-based configuration

**Pros:**
- ✅ Perfect for multi-repo deployments
- ✅ Each service manages its own routes independently
- ✅ Zero-downtime updates (hot-reload)
- ✅ Partial updates with PATCH
- ✅ Scalable to hundreds of services

**Cons:**
- ⚠️ Requires etcd running
- ⚠️ More complex initial setup
- ⚠️ Route config not directly in Git (JSON files pushed via API)

**When to use:** Production, multi-repo architectures, independent service teams

---

## Development Strategy (Mono-Repo)

### Current Setup

In the development environment (this repository), all services share a single APISIX configuration file:

**File:** `infrastructure/apisix/apisix.yaml`

```yaml
routes:
  - id: 1
    name: user-service-users
    uris:
      - /api/v1/users
      - /api/v1/users/*
    methods: [GET, POST, PUT, DELETE, OPTIONS]
    upstream_id: 1
    plugins:
      openid-connect: { ... }
      proxy-rewrite:
        regex_uri:
          - "^/api/v1/users(.*)"
          - "/v1.0/invoke/user-service/method/users$1"
      cors: { ... }
      zipkin: { ... }

  - id: 3
    name: user-service-roles
    uris:
      - /api/v1/roles
      - /api/v1/roles/*
    # ... similar configuration

upstreams:
  - id: 1
    name: user-service-upstream
    type: roundrobin
    nodes:
      "user-service:3500": 1
```

### Synchronization Process

APISIX routes are synchronized on startup via the `apisix-sync` container:

```bash
# Defined in infrastructure/docker-compose.yml
apisix-sync:
  image: apache/apisix:3.7.0-debian
  command:
    - /usr/local/apisix/apisix sync -f /usr/local/apisix/conf/apisix.yaml
  volumes:
    - ./apisix/apisix.yaml:/usr/local/apisix/conf/apisix.yaml:ro
  restart: "no"
```

**To apply route changes:**

```bash
cd infrastructure
docker-compose up -d --force-recreate apisix-sync
```

This reads `apisix.yaml` and pushes all routes to etcd.

### Adding a New Route (Dev)

1. **Edit** `infrastructure/apisix/apisix.yaml`
2. **Add route definition** with unique ID
3. **Resync**:
   ```bash
   cd infrastructure
   docker-compose up -d --force-recreate apisix-sync
   ```
4. **Verify** in APISIX Dashboard: http://localhost:9000

---

## Production Strategy (Multi-Repo)

### Architecture

In production, each microservice lives in its own Git repository:

```
Repositories:
  ├── aetherweave-user-service/       # Git repo 1
  │   ├── backend/
  │   ├── frontend/
  │   └── gateway/
  │       ├── README.md
  │       ├── deploy.sh
  │       └── routes/
  │           ├── users.json
  │           ├── roles.json
  │           └── health.json
  │
  ├── aetherweave-order-service/      # Git repo 2
  │   ├── backend/
  │   ├── frontend/
  │   └── gateway/
  │       └── routes/
  │           ├── orders.json
  │           └── payments.json
  │
  └── aetherweave-infrastructure/     # Git repo 3 (gateway, databases, etc.)
      └── apisix/
          └── config.yaml              # Only APISIX runtime config, NO routes
```

### Per-Service Gateway Directory

Each service repository contains a `gateway/` directory with:

```
gateway/
├── README.md           # Service-specific documentation
├── deploy.sh           # Deployment script
└── routes/
    ├── resource1.json  # Route config for resource 1
    └── resource2.json  # Route config for resource 2
```

**Example:** `services/user-service/gateway/` (see this repo for reference implementation)

### Deployment Workflow

When deploying a service in production:

```bash
# In service CI/CD pipeline (.github/workflows/deploy.yml)

# 1. Build and deploy backend/frontend
- run: docker build -t user-service:$VERSION backend/
- run: docker push user-service:$VERSION
- run: kubectl apply -f k8s/

# 2. Deploy APISIX routes via Admin API
- run: |
    cd gateway
    ./deploy.sh $APISIX_ADMIN_URL $ADMIN_API_KEY
```

The `deploy.sh` script pushes routes via REST API:

```bash
#!/bin/bash
for route_file in routes/*.json; do
  route_id=$(jq -r '.id' "$route_file")
  curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/routes/$route_id" \
    -H "X-API-KEY: $ADMIN_API_KEY" \
    -d @"$route_file"
done
```

### Key Benefits

1. **Service Autonomy**: Each team manages their own routes
2. **Independent Deployments**: Update Service A routes without touching Service B
3. **No Cross-Repo Dependencies**: No need to PR to a central gateway config repo
4. **Atomic Deployments**: Service code + routes deployed together
5. **Hot Updates**: APISIX reloads routes instantly, zero downtime

---

## Route Configuration Examples

### Declarative YAML (Development)

**File:** `infrastructure/apisix/apisix.yaml`

```yaml
routes:
  - id: user-service-users
    name: user-service-users
    uris:
      - /api/v1/users
      - /api/v1/users/*
    methods: [GET, POST, PUT, DELETE, OPTIONS]
    upstream_id: 1
    plugins:
      openid-connect:
        client_id: aetherweave-api
        client_secret: CHANGE_ME_IN_PRODUCTION
        discovery: http://keycloak:8080/realms/aetherweave/.well-known/openid-configuration
        scope: openid profile email
        bearer_only: true
        realm: aetherweave
        use_jwks: true
        token_signing_alg_values_expected: RS256
      proxy-rewrite:
        regex_uri:
          - "^/api/v1/users(.*)"
          - "/v1.0/invoke/user-service/method/users$1"
      cors:
        allow_origins: "**"
        allow_methods: "GET,POST,PUT,DELETE,OPTIONS"
        allow_headers: "Authorization,Content-Type,X-Requested-With"
        max_age: 86400
        allow_credential: true
      zipkin:
        endpoint: http://jaeger:9411/api/v2/spans
        sample_ratio: 1
        service_name: apisix-gateway
```

### Admin API JSON (Production)

**File:** `gateway/routes/users.json`

```json
{
  "id": "user-service-users",
  "name": "user-service-users",
  "uris": ["/api/v1/users", "/api/v1/users/*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "user-service:3500": 1
    },
    "timeout": {
      "connect": 6,
      "send": 30,
      "read": 30
    }
  },
  "plugins": {
    "openid-connect": { ... },
    "proxy-rewrite": {
      "regex_uri": [
        "^/api/v1/users(.*)",
        "/v1.0/invoke/user-service/method/users$1"
      ]
    },
    "cors": { ... },
    "zipkin": { ... }
  }
}
```

**Key Differences:**

1. **Upstream**: Declarative YAML uses `upstream_id` reference, Admin API embeds full upstream config
2. **Format**: YAML arrays vs JSON arrays (minor syntax)
3. **Deployment**: YAML synced via ADC, JSON pushed via HTTP PUT

---

## Deployment Workflows

### Development: Local Changes

```bash
# 1. Edit route
vim infrastructure/apisix/apisix.yaml

# 2. Resync APISIX
cd infrastructure
docker-compose up -d --force-recreate apisix-sync

# 3. Verify
curl http://localhost:9000  # APISIX Dashboard
# or
curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

### Production: Service Deployment

```bash
# In service CI/CD pipeline

# Step 1: Deploy application
kubectl apply -f k8s/deployment.yaml

# Step 2: Deploy gateway routes
cd gateway
./deploy.sh https://apisix-admin.production.com $ADMIN_API_KEY

# Step 3: Verify
curl https://api.production.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Production: Individual Route Update

```bash
# Update only the users route without affecting roles route
curl -X PUT https://apisix-admin.production.com/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d @gateway/routes/users.json
```

### Production: Partial Update with PATCH

```bash
# Change only CORS settings
curl -X PATCH https://apisix-admin.production.com/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: $ADMIN_API_KEY" \
  -d '{
    "plugins": {
      "cors": {
        "allow_origins": "https://app.production.com"
      }
    }
  }'
```

---

## Best Practices

### 1. Route Naming Convention

Use consistent, descriptive route IDs:

```
Pattern: {service-name}-{resource}

Examples:
  - user-service-users
  - user-service-roles
  - order-service-orders
  - payment-service-transactions
```

### 2. Route Organization

Group routes by service:

```yaml
# Development (apisix.yaml)
routes:
  # User Service
  - id: user-service-users
  - id: user-service-roles
  - id: user-service-health

  # Order Service
  - id: order-service-orders
  - id: order-service-items
```

### 3. Upstream Configuration

Define reusable upstreams:

```yaml
upstreams:
  - id: 1
    name: user-service-upstream
    type: roundrobin
    nodes:
      "user-service:3500": 1
    timeout:
      connect: 6
      send: 30
      read: 30
```

### 4. Plugin Consistency

Standardize plugins across services:

**Always include:**
- `openid-connect`: JWT authentication
- `proxy-rewrite`: Dapr service invocation mapping
- `cors`: Cross-origin headers
- `zipkin`: Distributed tracing

**Optionally add:**
- `rate-limit`: API throttling
- `request-validation`: JSON Schema validation
- `response-rewrite`: Header/body transformation

### 5. Security Hardening

**Development:**
```yaml
cors:
  allow_origins: "**"  # Allow all for local dev
```

**Production:**
```json
{
  "cors": {
    "allow_origins": "https://app.production.com,https://admin.production.com"
  }
}
```

**Secrets Management:**
- Never commit production `client_secret` to Git
- Use environment variable substitution in CI/CD
- Rotate Admin API keys regularly

### 6. Testing Strategy

```bash
# 1. Test in dev with declarative config
cd infrastructure
docker-compose up -d

# 2. Test Admin API deployment locally
cd services/user-service/gateway
./deploy.sh http://localhost:9180 admin-key-aetherweave

# 3. Verify routes work
curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"

# 4. Deploy to production
# (via CI/CD)
```

### 7. Versioning Routes

When making breaking changes:

```bash
# Option A: Create new versioned route
POST /api/v2/users  → new route ID: user-service-users-v2

# Option B: Use weighted routing for gradual rollout
{
  "upstream": {
    "nodes": {
      "user-service-v1:3500": 90,  # 90% traffic
      "user-service-v2:3500": 10   # 10% traffic
    }
  }
}
```

### 8. Monitoring and Observability

**Check route status:**
```bash
curl http://apisix:9180/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: admin-key-aetherweave" | jq .
```

**Verify in Dashboard:**
- APISIX Dashboard: http://localhost:9000 (dev) or production URL
- Jaeger Tracing: http://localhost:16686
- Prometheus Metrics: http://localhost:9090

---

## Future: Code Generator Integration

The AetherWeave code generator will automate route configuration:

**Input:** YAML meta-model

```yaml
service: user-service
entities:
  - name: User
    path: /users
    operations: [GET, POST, PUT, DELETE]

  - name: Role
    path: /roles
    operations: [GET, POST, PUT, DELETE]
```

**Generated Output:**

1. Backend NestJS controllers (`/users`, `/roles`)
2. Frontend Web Components
3. **Gateway route configurations** (`gateway/routes/users.json`, `roles.json`)
4. Deployment scripts (`gateway/deploy.sh`)

---

## Reference Files

- Example gateway config: [`services/user-service/gateway/`](../services/user-service/gateway/)
- Development APISIX config: [`infrastructure/apisix/apisix.yaml`](../infrastructure/apisix/apisix.yaml)
- HTTP test file: [`services/user-service.http`](../services/user-service.http)
- APISIX Docker Compose: [`infrastructure/docker-compose.yml`](../infrastructure/docker-compose.yml)

## External Documentation

- [APISIX Admin API](https://apisix.apache.org/docs/apisix/admin-api/)
- [APISIX Deployment Modes](https://apisix.apache.org/docs/apisix/deployment-modes/)
- [APISIX Declarative CLI (ADC)](https://docs.api7.ai/apisix/reference/adc/)
- [APISIX Plugins](https://apisix.apache.org/docs/apisix/plugins/openid-connect/)

---

**Last Updated:** 2025-10-25
**Maintained By:** AetherWeave Team

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Documentation Hierarchy

**READ THESE FILES BASED ON YOUR TASK**:

- **Working on Portal** → [portal/PORTAL.md](portal/PORTAL.md)
  - Portal architecture, routing, auth, EventBus, logging, settings
  - Adding pages, translations, navigation
  - Integrating Web Components

- **Creating Composed Pages** → [docs/COMPOSED_PAGES.md](docs/COMPOSED_PAGES.md)
  - **Architecture for composable micro-frontend pages**
  - Multiple Web Components from different services on one page
  - Stateful EventBus for cross-component communication
  - Creating dashboards and complex views

- **Creating/Working on Web Components** → [docs/WEB_COMPONENTS.md](docs/WEB_COMPONENTS.md)
  - Step-by-step WC creation guide
  - Lit framework, i18n, EventBus integration
  - Properties, styling, API calls
  - Using **@aetherweave/wc-core** package (framework-agnostic)

- **Working on Backend Services** → [docs/BACKEND.md](docs/BACKEND.md) *(TODO)*
  - NestJS architecture, TypeORM, Dapr integration
  - Creating controllers, services, entities

- **Gateway & API Routing** → [docs/GATEWAY.md](docs/GATEWAY.md)
  - APISIX strategies: Standalone (dev) vs Admin API (production)
  - Multi-repo deployment with Admin API
  - Per-service route management
  - Example: [services/user-service/gateway/](services/user-service/gateway/)

- **Infrastructure & DevOps** → This file (CLAUDE.md)
  - Docker, APISIX, Keycloak, Dapr setup
  - Observability stack

- **Project Vision** → [architecture/dream.md](architecture/dream.md)
  - Long-term goals, meta-model strategy

## Language Policy

**CRITICAL**: All code, comments, documentation, commit messages, file names, and project artifacts MUST be written in **ENGLISH ONLY**.

- Communication with the user can be in French
- Everything generated in the project MUST be in English (code, comments, docs, variable names, commit messages, etc.)

Before doing a really big change, stop and ask to your user if he is connected !

## Project Vision

**AetherWeave is a code generator and reference implementation for cloud-native microservices.**

This repository serves dual purposes:
1. **CLI Code Generator** - Generates backend services, frontend web components, and infrastructure from YAML meta-models
2. **Reference Implementation** - Best practices example showing the generated output architecture

### Key Principles (see architecture/dream.md)

- **Meta-model driven**: YAML definitions → generated code (custom-code-first oriented)
- **Multi-language support**: TypeScript/NestJS (v1), C# .NET, Java (future)
- **Micro-frontend pattern**: Web Components (Lit, Stencil) with portal aggregation
- **CNCF stack**: Dapr, Apache APISIX, Keycloak, observability tools
- **GitOps**: Git as source of truth, mono-repo per service (frontend + backend together)
- **Zero-trust security**: JWT at gateway, mTLS between services via Dapr, no auth in business code

### Current Stack (v1 - TypeScript)

- **Backend**: NestJS with TypeORM and PostgreSQL
- **Frontend Portal**: Vue.js 3 + Vuetify (shell app for micro-frontend orchestration)
- **Frontend Components**: Web Components (Lit/Stencil - in development)
- **Service Mesh**: Dapr runtime for service invocation, pub/sub, state management
- **API Gateway**: Apache APISIX (CNCF project with etcd for dynamic configuration)
- **API Documentation**: Scalar UI (beautiful, modern alternative to Swagger UI)
- **Auth**: OAuth2/OIDC via oidc-client-ts (provider-agnostic, configured for Keycloak)
- **Observability**: Jaeger (tracing), Prometheus (metrics), Grafana (dashboards)

## Development Commands

### Infrastructure Setup

```bash
# From infrastructure/ directory

# Start the entire infrastructure stack
docker-compose up -d

# Stop infrastructure
docker-compose down

# Complete reset (including volumes)
docker-compose down -v

# View logs for specific service
docker-compose logs -f [service-name]

# Check service status
docker-compose ps
```

### Full Reset and Test (Recommended for clean start)

```bash
# From infrastructure/ directory
./reset-and-test.sh

# This script will:
# 1. Stop all containers
# 2. Remove data/ directory
# 3. Rebuild and start everything
# 4. Wait for all services to be ready
# 5. Initialize APISIX routes automatically
# 6. Run comprehensive tests
# 7. Display access URLs
```

### Portal Development

```bash
cd portal

# Install dependencies
pnpm install

# Development mode with hot reload
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run with Docker
docker-compose up -d

# Access portal
# Development: http://localhost:5173
# Production: http://localhost:8000 (via APISIX)
```

### Service Development (user-service example)

```bash
cd services/user-service/backend

# Install dependencies
pnpm install

# Development mode with hot reload
pnpm run start:dev

# Build
pnpm run build

# Production mode
pnpm run start:prod

# Linting
pnpm run lint

# Format code
pnpm run format

# Run tests
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e
```

### Docker Operations

```bash
# Build and start a service with docker-compose
cd services/user-service
docker-compose up -d

# Rebuild after changes
docker-compose up -d --build user-service

# View service logs
docker-compose logs -f user-service
```

## Architecture

### Repository Structure

```
aetherWeave/
├── architecture/         # Vision and design documents
├── infrastructure/       # Shared infrastructure stack (Dapr, APISIX, Keycloak, etc.)
├── portal/              # Vue.js shell app (micro-frontend orchestrator)
├── services/            # Microservices (mono-repo pattern: backend + frontend together)
│   └── user-service/
│       ├── backend/     # NestJS backend
│       └── frontend/    # Web Component (future)
└── generator/           # CLI code generator (future)
```

### Service Communication Flow

```
Browser → Portal (Vue.js) → APISIX → Dapr Sidecar → Backend Service
                              ↓
                         OAuth2/OIDC (Keycloak)
```

**Portal to Backend**:
1. User authenticates via OAuth2/OIDC (oidc-client-ts library)
2. Portal obtains JWT token and stores it
3. Portal makes API calls to APISIX gateway with JWT in Authorization header
4. APISIX validates JWT via OpenID Connect plugin (JWKS validation)
5. APISIX routes to appropriate Dapr sidecar
6. Dapr invokes the target backend service
7. Automatic distributed tracing to Jaeger via Zipkin plugin
8. Prometheus metrics exposed at :9091

### Dapr Service Invocation

Services communicate via Dapr sidecars using the service invocation API:

```typescript
// From within a service, call another service via Dapr
const response = await fetch('http://localhost:3500/v1.0/invoke/target-service/method/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Pub/Sub Pattern

```typescript
// Publish a message
await fetch('http://localhost:3500/v1.0/publish/pubsub/event-name', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' })
});
```

### State Management

Dapr provides state store backed by Redis. Components are configured in `infrastructure/dapr/components/`.

## Authentication

### Portal Authentication

The portal uses **oidc-client-ts** for OAuth2/OIDC authentication (provider-agnostic):
- Configured for Keycloak by default
- Can be switched to Auth0, Okta, or any OIDC-compliant provider
- Configuration in `portal/.env`
- JWT token stored in memory and passed to API calls

**Login Flow**:
1. User clicks "Login" in portal header
2. Redirected to Keycloak login page
3. After authentication, redirected back to `/callback`
4. Portal stores JWT and user profile
5. All API calls include `Authorization: Bearer <token>` header

### Getting a JWT Token (for testing)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)
```

### Testing Authenticated Endpoints

```bash
# Via APISIX Gateway (recommended - tests full stack)
curl http://localhost:8000/api/v1/users/ \
  -H "Authorization: Bearer $TOKEN"

# Direct to service (bypasses gateway - dev only)
curl http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"

# Via Dapr sidecar (for service-to-service testing)
curl http://localhost:3500/v1.0/invoke/user-service/method/users
```

### Default Keycloak Users

- **admin / admin** (admin@example.com) - admin role
- **fof / password** (fof@example.com) - user role

Keycloak admin console: http://localhost:8080 (admin/admin)

### Keycloak Client Configuration

The portal requires a dedicated OAuth2 client in Keycloak:
- **Client ID**: `aetherweave-portal`
- **Client Type**: Public (SPA)
- **Valid redirect URIs**: `http://localhost:5173/callback`, `http://localhost:8000/callback`
- **Valid post logout redirect URIs**: `http://localhost:5173`, `http://localhost:8000`
- **Web origins**: `http://localhost:5173`, `http://localhost:8000`

## Adding a New Service

### 1. Service Structure

Create in `services/new-service/` with:
- NestJS application
- Dockerfile (multi-stage build with node:20-alpine)
- docker-compose.yml for the service and its Dapr sidecar

### 2. Docker Compose Configuration

Add to `services/new-service/docker-compose.yml`:

```yaml
networks:
  aetherweave-net:
    external: true
    name: aetherweave-net

services:
  new-service:
    build: .
    container_name: new-service
    environment:
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: devuser
      DB_PASSWORD: devpassword
      DB_NAME: aetherweave
    networks:
      - aetherweave-net
    restart: unless-stopped

  new-service-dapr:
    image: daprio/daprd:1.12.0
    container_name: new-service-dapr
    command: [
      "./daprd",
      "-app-id", "new-service",
      "-app-port", "3000",
      "-dapr-http-port", "3500",
      "-dapr-grpc-port", "50001",
      "-placement-host-address", "dapr-placement:50006",
      "-components-path", "/components",
      "-config", "/config/config.yaml"
    ]
    volumes:
      - ../../infrastructure/dapr/components:/components
      - ../../infrastructure/dapr/config:/config
      - ../../infrastructure/dapr/secrets:/secrets
    depends_on:
      - new-service
    network_mode: "service:new-service"
    restart: unless-stopped
```

### 3. Update APISIX Configuration

Add routes in `infrastructure/apisix/apisix.yaml`:

```yaml
routes:
  - id: new-service-route
    uri: /api/v1/new-service/*
    methods: [GET, POST, PUT, DELETE, PATCH]
    upstream:
      type: roundrobin
      nodes:
        "new-service:3500": 1
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
          - "^/api/v1/new-service(.*)"
          - "/v1.0/invoke/new-service/method$1"
      cors:
        allow_origins: "*"
        allow_methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS"
        allow_headers: "Authorization,Content-Type,X-Requested-With"
```

### 4. Service Implementation Pattern (Reference for Generator Output)

The **user-service** demonstrates the expected structure for generated services:

**Core files** (generated):
- `src/main.ts` - Bootstrap with Swagger/OpenAPI, CORS, validation pipes
- `src/app.module.ts` - TypeORM configuration, module imports
- `src/health/health.controller.ts` - Health check endpoint (always generated)

**Feature module** (generated from YAML meta-model):
- `src/[entity]/[entity].module.ts` - Feature module with TypeORM entity registration
- `src/[entity]/[entity].controller.ts` - REST endpoints (CRUD auto-generated)
- `src/[entity]/[entity].service.ts` - Business logic (base CRUD + custom methods)
- `src/[entity]/[entity].entity.ts` - TypeORM entity from meta-model
- `src/[entity]/dto/*.dto.ts` - DTOs with class-validator decorators

**Custom code placement** (developer adds):
- `src/[entity]/[entity].service.ts` - Add custom methods beyond CRUD
- `src/[entity]/[entity].controller.ts` - Add custom endpoints
- Create new files in feature folder for complex business logic

**Key principle**: Generated code provides foundation, custom code extends it without modifying generated files.

## Database

### Connection Details

- Host: `postgres` (container) or `localhost:5432` (host)
- Database: `aetherweave`
- User: `devuser`
- Password: `devpassword`

### TypeORM Configuration

In app.module.ts:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpassword',
  database: process.env.DB_NAME || 'aetherweave',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
})
```

## Observability

### APISIX Dashboard
- URL: http://localhost:9000
- Credentials: admin/admin
- Web UI to manage routes, plugins, upstreams
- Real-time metrics and monitoring

### API Documentation (Scalar UI)
- URL: http://localhost:3200
- Beautiful, modern API documentation portal
- Auto-aggregates OpenAPI specs from all services
- Interactive API client with JWT authentication
- Much better UX than Swagger UI

### Jaeger (Distributed Tracing)
- URL: http://localhost:16686
- APISIX automatically sends traces via Zipkin plugin
- View complete request flows across gateway → Dapr → services

### Prometheus (Metrics)
- URL: http://localhost:9090
- Scrapes metrics from:
  - APISIX gateway (port 9091)
  - Dapr sidecars
  - Services
- Pre-configured scrape configs

### Grafana (Dashboards)
- URL: http://localhost:3100
- Credentials: admin/admin
- Pre-configured with Prometheus datasource
- Import dashboards: APISIX, Dapr (14454), RabbitMQ (10991), PostgreSQL (9628)

### RabbitMQ Management
- URL: http://localhost:15672
- Credentials: admin/admin
- Monitor queues and message flows

## Configuration Files

### Dapr Components
- `infrastructure/dapr/components/statestore.yaml` - Redis state store
- `infrastructure/dapr/components/pubsub.yaml` - RabbitMQ pub/sub
- `infrastructure/dapr/components/secrets.yaml` - Secret store reference
- `infrastructure/dapr/config/config.yaml` - Dapr runtime config
- `infrastructure/dapr/secrets/secrets.json` - Keycloak client secrets

### APISIX Gateway
- `infrastructure/apisix/config.yaml` - APISIX runtime configuration
- `infrastructure/apisix/apisix.yaml` - Routes and plugin configuration
  - OpenID Connect integration with Keycloak
  - Route mapping to Dapr sidecars
  - CORS, rate limiting, request validation
  - Distributed tracing to Jaeger via Zipkin plugin
- `infrastructure/apisix/dashboard_conf.yaml` - Dashboard configuration

### Keycloak
- `infrastructure/keycloak/realms/` - Realm import configuration
- Realm: `aetherweave`
- Client: `aetherweave-api`
- Automated import on startup

## Important Notes

### Automatic Route Initialization
APISIX routes are automatically configured on startup via the `apisix-init` container. This container:
- Waits for APISIX to be ready
- Creates routes via Admin API
- Configures JWT authentication with Keycloak
- Sets up CORS, tracing, and proxy rewrite rules
- Exits after initialization (restart: "no")

If you need to reconfigure routes, either:
1. Modify `infrastructure/apisix/init-routes.sh` and run `docker-compose up -d --build apisix-init`
2. Use APISIX Dashboard at http://localhost:9000
3. Use Admin API directly with `curl`

### TypeORM Synchronize
Set `synchronize: false` in production. Use migrations instead.

### Port Allocation
Each service needs unique Dapr ports:
- Dapr HTTP: 3500, 3501, 3502, etc.
- Dapr gRPC: 50001, 50002, 50003, etc.
- App port: 3000 (can be same across services when using network_mode: "service:service-name")

### Network Mode
Dapr sidecars use `network_mode: "service:service-name"` to share the network namespace with their service, enabling localhost communication.

### Secret Management
For production:
1. Change APISIX Admin API key in `infrastructure/apisix/config.yaml`
2. Change Keycloak client secret in `infrastructure/dapr/secrets/secrets.json`
3. Update `infrastructure/keycloak/realms/aetherweave-realm.json`
4. Change all default passwords (Keycloak, Grafana, RabbitMQ, APISIX Dashboard)
5. Enable SSL in Keycloak and APISIX
6. Restrict CORS origins in APISIX routes
7. Restrict `allow_admin` in APISIX config

## Troubleshooting

### Dapr sidecar won't start
```bash
# Check placement service
docker-compose ps dapr-placement

# View sidecar logs
docker-compose logs [service-name]-dapr
```

### APISIX returns errors
```bash
# Check APISIX health
curl http://localhost:8000/health

# View routes via Admin API
curl http://localhost:9180/apisix/admin/routes -H 'X-API-KEY: admin-key-aetherweave'

# Check etcd connectivity
docker-compose exec etcd etcdctl endpoint health

# View APISIX logs
docker-compose logs -f apisix
```

### JWT validation fails
```bash
# Decode token to verify audience
echo $TOKEN | cut -d '.' -f2 | base64 -d 2>/dev/null | jq .

# Verify audience is "aetherweave-api"
echo $TOKEN | cut -d '.' -f2 | base64 -d 2>/dev/null | jq .aud
```

### Database connection issues
```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U devuser -d aetherweave -c '\dt'
```

## Generator Development Guidelines

### Current Phase: Manual Reference Implementation

**IMPORTANT**: There is NO generator yet. We are currently in the **reference implementation phase**.

The workflow is:
1. **Now**: Build services manually (user-service, etc.) following best practices
2. **These manual services** become the reference/templates for what the generator will produce
3. **Later**: Build the CLI generator that will automate this based on YAML meta-models

### Repository Structure

This repository is organized to support both phases:
- **Reference implementation** in `services/` (CURRENT PHASE) - Manually built examples showing best practices
- **Generator CLI** (FUTURE) - Will read YAML meta-models and generate services based on these references

### Meta-Model Format (Future)

Services will be defined via YAML files containing:
- Entity definitions with fields, types, and relationships
- API configuration (REST OpenAPI, gRPC)
- CRUD operations to generate per entity
- Validation rules (JSON Schema)

### Generated Artifacts (per service)

The generator will produce:
1. **Backend code** - NestJS service with CRUD operations
2. **Frontend code** - Web Components for the service
3. **Infrastructure configs** - Dockerfile, docker-compose.yml, Dapr components
4. **API documentation** - OpenAPI specs auto-published to Kong gateway
5. **Deployment manifests** - K8s manifests with Dapr annotations

### Web Components & Portal (Planned)

- Each backend service generates one or more Web Components
- Components communicate via Custom Events, shared state, or component-to-component calls
- Portal application loads and orchestrates all components
- Shared authentication token across components (no re-auth needed)
- Distribution via private npm packages

### API Gateway & Documentation

Currently using **Apache APISIX** with **Scalar UI**:
- **APISIX**: CNCF API Gateway with rich plugin ecosystem
- **Scalar UI**: Modern, beautiful API documentation (better than Swagger UI)
- **Auto-discovery**: api-docs service scans and aggregates all OpenAPI specs
- **No per-service Swagger**: Services don't expose /api endpoints, APISIX handles all external traffic
- **Centralized management**: APISIX Dashboard for route/plugin configuration

**Future consideration**: Backstage for service catalog + developer portal (can coexist with current stack)

### Future Technology Support

**Backend languages** (beyond TypeScript):
- C# .NET with Entity Framework
- Java with Spring Boot

**Message brokers** (Dapr abstraction allows switching):
- RabbitMQ (current)
- Apache Kafka
- Redis Streams

**Frontend frameworks** (templating options):
- Lit (v1)
- Stencil
- Angular
- React

### Development Workflow Principles

1. **GitOps-driven**: YAML meta-model changes trigger regeneration
2. **Semantic versioning**: Strict versioning for all generated packages
3. **Mono-repo per service**: Frontend + backend in same repository
4. **Private npm packages**: Shared libraries (auth, logging, utils)
5. **No auth in services**: JWT validation at Kong, mTLS via Dapr, business logic stays clean

### When Building Services Manually (Current Phase)

When creating or modifying services like `user-service`:
- **You are creating the blueprint** - These manual implementations will be templates for the future generator
- **Document patterns clearly** - What you build now will be replicated by the generator
- **Keep business logic separate** from infrastructure concerns (Dapr handles that)
- **Never add auth code** - Security is handled by API Gateway (JWT) and Dapr (mTLS)
- **Always generate OpenAPI specs** - Will feed the API documentation portal (Scalar/Backstage)
- **Follow NestJS best practices** - Modules, controllers, services, DTOs, entities separation
- **Think "What would the generator produce?"** - Clean, consistent, predictable structure

### Building the Generator (Future Phase)

The generator will:
1. Read YAML meta-models (entity definitions, relationships, CRUD config)
2. Use the manual services in `services/` as templates
3. Generate code following the exact same patterns we establish now
4. Produce: backend code, frontend web components, infrastructure configs, OpenAPI specs, K8s manifests

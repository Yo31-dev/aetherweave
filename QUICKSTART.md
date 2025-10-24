# Quick Start Guide - Micro-Frontend Demo

This guide shows how to run the complete AetherWeave micro-frontend stack.

## Architecture Overview

```
Portal (Vue.js) ← → Web Component (Lit) ← → Backend (NestJS) ← → Database (PostgreSQL)
    ↓                     ↓                      ↓
  Port 5173          Port 3001              Port 3000
    ↓                                            ↓
    └──────────────── APISIX Gateway (Port 8000) ───┘
                              ↓
                        Keycloak (Port 8080)
```

## Prerequisites

- Docker & Docker Compose (for infrastructure)
- Node.js 20+
- pnpm

## Step 1: Start Infrastructure

```bash
cd infrastructure
docker-compose up -d

# Wait for all services to be ready (30-60 seconds)
docker-compose ps
```

**Services started**:
- PostgreSQL (port 5432)
- Keycloak (port 8080)
- APISIX Gateway (port 8000)
- Redis, RabbitMQ, Jaeger, Prometheus, Grafana

## Step 2: Start Backend Service

```bash
cd services/user-service/backend
pnpm install
pnpm run start:dev
```

Backend runs on **port 3000** (NestJS with hot reload).

## Step 3: Start Frontend Web Component

```bash
cd services/user-service/frontend
pnpm install
pnpm dev
```

Web Component dev server runs on **port 3001** (Vite with hot reload).

## Step 4: Start Portal

```bash
cd portal
pnpm install
pnpm dev
```

Portal runs on **port 5173** (Vite with hot reload).

## Step 5: Access the Application

Open your browser:
- **Portal**: http://localhost:5173
- **Keycloak Admin**: http://localhost:8080 (admin/admin)
- **APISIX Dashboard**: http://localhost:9000 (admin/admin)
- **API Docs (Scalar)**: http://localhost:3200

## Step 6: Login

1. Click "Login" button in the portal header
2. You'll be redirected to Keycloak
3. Login with:
   - Username: `fof`
   - Password: `password`
4. You'll be redirected back to the portal dashboard

## Step 7: Open User Management

1. Click on "Users" in the sidebar (or dashboard card)
2. The portal dynamically loads the Web Component from port 3001
3. The Web Component receives the JWT token via Custom Events
4. User list is fetched from the backend API

## What's Happening Behind the Scenes

### Portal → Web Component Communication

1. **Portal authenticates** user via Keycloak (OAuth2/OIDC)
2. **Portal stores** JWT token
3. **Portal dispatches** Custom Event:
   ```javascript
   window.dispatchEvent(new CustomEvent('portal:auth:update', {
     detail: { token: 'JWT...', user: {...} }
   }));
   ```
4. **Web Component listens** and receives the token
5. **Web Component makes** API calls with the token

### Web Component → Backend API

1. Web Component calls `/api/v1/users`
2. Request goes through **Vite proxy** → **APISIX Gateway**
3. APISIX validates JWT with Keycloak
4. APISIX routes to backend via Dapr sidecar
5. Backend returns data
6. Web Component displays users

## Development Workflow

### Hot Reload

All three dev servers support hot reload:
- **Portal** changes → Instant refresh
- **Web Component** changes → Instant refresh
- **Backend** changes → Auto-restart

### Making Changes

**Add a new user** (backend):
1. Edit `services/user-service/backend/src/users/users.controller.ts`
2. Changes auto-reload

**Modify UI** (Web Component):
1. Edit `services/user-service/frontend/src/user-management-app.ts`
2. Changes instantly reflect in browser

**Change Portal** layout:
1. Edit `portal/src/layouts/DefaultLayout.vue`
2. Hot reload updates UI

## Testing the Full Stack

### Create a User

Currently via API (UI form TODO):
```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# Create user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

Refresh the Web Component to see the new user.

### Delete a User

Click the "Delete" button next to a user in the Web Component.

## Troubleshooting

### Portal shows "Failed to load micro-frontend"

**Check**:
1. Web Component dev server is running on port 3001
2. Browser console for errors
3. Vite proxy configuration in `portal/vite.config.ts`

### API calls return 401 Unauthorized

**Check**:
1. You're logged in (check portal header for username)
2. JWT token is being passed (check browser DevTools → Network → Headers)
3. Keycloak is running: http://localhost:8080

### Web Component not showing users

**Check**:
1. Backend is running on port 3000
2. APISIX is running: http://localhost:8000/health
3. Browser console for API errors
4. Database has users (check logs)

### "Cannot connect to Keycloak"

**Check**:
1. Keycloak container is running: `docker-compose ps keycloak`
2. Wait 30-60 seconds after starting infrastructure
3. Check Keycloak logs: `docker-compose logs keycloak`

## Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Portal (Vue.js) | 5173 | http://localhost:5173 |
| Web Component (Lit) | 3001 | http://localhost:3001 |
| Backend (NestJS) | 3000 | http://localhost:3000 |
| APISIX Gateway | 8000 | http://localhost:8000 |
| Keycloak | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432 |
| APISIX Dashboard | 9000 | http://localhost:9000 |
| Scalar API Docs | 3200 | http://localhost:3200 |
| Jaeger UI | 16686 | http://localhost:16686 |
| Grafana | 3100 | http://localhost:3100 |

## Next Steps

- Add Create/Edit user forms (Web Component)
- Add more microservices (products, orders, etc.)
- Implement i18n in Web Component
- Add pagination and search
- Deploy to production

## Production Build

```bash
# Build portal
cd portal && pnpm build

# Build Web Component
cd services/user-service/frontend && pnpm build

# Build backend
cd services/user-service/backend && pnpm build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

For detailed production deployment, see `CLAUDE.md`.

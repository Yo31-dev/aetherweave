# AetherWeave Portal

Vue.js 3 shell application for micro-frontend orchestration.

## Overview

The portal serves as the main entry point and orchestrator for AetherWeave's micro-frontend architecture:
- **Authentication**: OAuth2/OIDC via oidc-client-ts (provider-agnostic)
- **Token Management**: JWT storage and propagation to backend services
- **Component Loading**: Dynamic loading of Web Components from microservices (planned)
- **UI Framework**: Vuetify (Material Design)

## Technology Stack

- **Framework**: Vue.js 3 (Composition API + TypeScript)
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Auth**: oidc-client-ts (OAuth2/OIDC)
- **Build Tool**: Vite
- **Deployment**: Nginx (Docker)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for containerized deployment)

### Installation

```bash
pnpm install
```

### Configuration

Copy `.env.example` to `.env` and configure OAuth2 settings:

```env
VITE_OIDC_AUTHORITY=http://localhost:8080/realms/aetherweave
VITE_OIDC_CLIENT_ID=aetherweave-portal
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Development

```bash
pnpm dev
```

Access at http://localhost:5173

### Production Build

```bash
pnpm build
pnpm preview
```

### Docker Deployment

```bash
docker-compose up -d
```

Access via APISIX gateway: http://localhost:8000

## Authentication Flow

1. User clicks "Login" button in header
2. Portal redirects to OAuth2 provider (Keycloak)
3. User authenticates with username/password
4. Provider redirects back to `/callback` with authorization code
5. oidc-client-ts exchanges code for JWT token
6. Portal stores user profile and token in Pinia store
7. All API requests include `Authorization: Bearer <token>` header

## Features

### Current

- ✅ OAuth2/OIDC authentication (provider-agnostic)
- ✅ JWT token management
- ✅ User profile display
- ✅ Login/logout flow
- ✅ Silent token renewal
- ✅ Responsive Material Design UI (Vuetify)
- ✅ Docker deployment
- ✅ APISIX integration

### Planned

- 🔲 Dynamic Web Component loading
- 🔲 Micro-frontend orchestration
- 🔲 Event bus for component communication

## License

MIT

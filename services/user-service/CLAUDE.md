# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

User Service is a NestJS-based microservice within the AetherWeave distributed system. It manages user CRUD operations and integrates with a broader aetherweave architecture using Dapr, Envoy Gateway, and Keycloak for authentication.

## Common Commands

### Development
```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run start:dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

### Testing
```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

### Code Quality
```bash
# Run linter
pnpm run lint

# Format code
pnpm run format
```

### Docker
```bash
# Build Docker image
docker build -t user-service .

# Start service with docker-compose (includes Dapr sidecar)
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Stop and remove containers
docker-compose down
```

## Architecture

### Technology Stack
- **Framework**: NestJS (Node.js framework with TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator and class-transformer
- **API Documentation**: OpenAPI/Swagger
- **Package Manager**: pnpm

### Integration Points

**Dapr Sidecar**: Each service runs alongside a Dapr sidecar container (port 3500 HTTP, 50001 gRPC) for:
- Service-to-service invocation
- Pub/sub messaging via RabbitMQ
- State management via Redis
- Distributed tracing

**Envoy Gateway**: External API requests route through Envoy (port 8000) which handles:
- JWT validation via Keycloak
- Rate limiting
- Routing to services via Dapr

**Keycloak**: Provides JWT authentication with realm `aetherweave` and client `aetherweave-api`

### Database Connection
TypeORM is configured in `src/app.module.ts` with automatic entity synchronization (`synchronize: true`) - **this should be disabled in production**. Connection details are pulled from environment variables with sensible defaults for local development.

### Module Structure
The service follows NestJS module architecture:
- **AppModule**: Root module that imports TypeOrmModule and UsersModule
- **UsersModule**: Encapsulates user-related functionality (controller, service, entity)
- **HealthController**: Provides health check endpoint (public, no JWT required)

### Validation and DTO Pattern
All incoming requests are validated using class-validator decorators in DTOs (e.g., `CreateUserDto`). Global validation pipe is configured in `main.ts` with `whitelist: true` to strip unknown properties.

### OpenAPI Documentation
Swagger documentation is auto-generated and available at `/api` endpoint. Controllers and DTOs use `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` decorators for documentation.

## Testing the Service

### Local Development
```bash
# Direct access (bypasses JWT)
curl http://localhost:3000/health
curl http://localhost:3000/users
```

### Via Dapr Sidecar
```bash
# Health check via Dapr
curl http://localhost:3500/v1.0/invoke/user-service/method/health

# Create user
curl -X POST http://localhost:3500/v1.0/invoke/user-service/method/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'
```

### Via Envoy Gateway (requires JWT)
```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# Call API through gateway
curl http://localhost:8000/api/v1/health -H "Authorization: Bearer $TOKEN"
curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

## Environment Variables

Required for database connectivity (defaults are configured for local development):
- `PORT` - Service HTTP port (default: 3000)
- `DB_HOST` - PostgreSQL host (default: postgres)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USER` - Database user (default: devuser)
- `DB_PASSWORD` - Database password (default: devpassword)
- `DB_NAME` - Database name (default: aetherweave)

## Important Architectural Considerations

### Dapr Service Invocation
When calling other services, use Dapr service invocation rather than direct HTTP calls:
```typescript
const response = await fetch('http://localhost:3500/v1.0/invoke/target-service/method/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### TypeORM Synchronize Flag
The `synchronize: true` flag in TypeORM configuration automatically syncs schema changes. **This must be set to `false` in production** and replaced with proper migrations.

### Docker Network
The service must be on the `aetherweave-net` external Docker network to communicate with infrastructure services (postgres, redis, rabbitmq, keycloak, etc.).

### Health Check Endpoint
The `/health` endpoint is public and should not require authentication - it's used by orchestration systems and load balancers.

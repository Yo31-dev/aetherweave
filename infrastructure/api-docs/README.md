# API Documentation Portal

Scalar-based API documentation portal for all AetherWeave microservices.

## Quick Start

```bash
# Build and start
docker-compose up -d api-docs

# Access portal
open http://localhost:3200
```

## Updating API Specs with gitlab-ci-local

**Install gitlab-ci-local:**
```bash
npm install -g gitlab-ci-local
```

**Update OpenAPI spec from a service:**
```bash
# Go to service directory
cd services/user-service

# Run the pipeline locally
gitlab-ci-local generate-openapi

# The openapi.json file is now in services/user-service/
# Copy it manually to infrastructure/api-docs/specs/
cp openapi.json ../../infrastructure/api-docs/specs/user-service.json

# Rebuild api-docs container
cd ../../infrastructure
docker-compose up -d --build api-docs
```

**One-liner update:**
```bash
cd services/user-service && \
  gitlab-ci-local generate-openapi && \
  cp openapi.json ../../infrastructure/api-docs/specs/user-service.json && \
  cd ../../infrastructure && \
  docker-compose up -d --build api-docs
```

## Manual Update (without gitlab-ci-local)

```bash
cd services/user-service
npm run generate:openapi
cp openapi.json ../../infrastructure/api-docs/specs/user-service.json
cd ../../infrastructure
docker-compose up -d --build api-docs
```

## Architecture

- **Nginx**: Serves static HTML and OpenAPI specs
- **Scalar UI**: Loaded via CDN, renders aggregated specs
- **No runtime**: All specs are static files (no fetching)
- **Memory efficient**: Services don't run Swagger UI

## Adding New Services

1. Generate OpenAPI spec in service
2. Copy to `specs/[service-name].json`
3. Update `specs/aggregated.json` to include new service paths
4. Rebuild container

## Files

- `Dockerfile` - Nginx container with static files
- `nginx.conf` - Nginx configuration
- `public/index.html` - Scalar UI loader
- `specs/` - OpenAPI JSON files (versioned in Git)

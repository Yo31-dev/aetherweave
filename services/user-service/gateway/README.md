# User Service - Gateway Configuration

This directory contains APISIX gateway route configurations for the user-service in **production multi-repo deployments**.

## 📁 Directory Structure

```
gateway/
├── README.md           # This file
├── deploy.sh           # Deployment script for production
└── routes/
    ├── users.json      # Route configuration for /api/v1/users
    ├── roles.json      # Route configuration for /api/v1/roles
    └── health.json     # Route configuration for /api/v1/health
```

## 🎯 Purpose

In production, each microservice lives in its own Git repository. This `gateway/` directory allows each service to **own and manage its own API gateway routes** independently, without relying on a centralized configuration repository.

## 🏗️ Architecture

### Development (Standalone Mode)
- **Location**: `infrastructure/apisix/apisix.yaml` (centralized, mono-repo)
- **Sync Method**: `adc sync -f apisix.yaml` (declarative, full replacement)
- **Use Case**: Local development, testing, all services in one repo

### Production (Traditional Mode)
- **Location**: `services/*/gateway/routes/*.json` (distributed, per service)
- **Deployment Method**: APISIX Admin API (incremental updates)
- **Use Case**: Production, each service in its own repository

## 🚀 Deployment Workflow

### Prerequisites

1. **APISIX running** in Traditional mode (with etcd)
2. **Admin API accessible** (default: `http://apisix:9180`)
3. **Admin API key** configured

### Manual Deployment

```bash
# Set environment variables
export APISIX_ADMIN_URL="http://apisix:9180"
export ADMIN_API_KEY="your-secret-key"

# Deploy all routes for this service
cd services/user-service/gateway
./deploy.sh $APISIX_ADMIN_URL $ADMIN_API_KEY
```

### CI/CD Integration

Add to your `.github/workflows/deploy.yml` or equivalent:

```yaml
- name: Deploy APISIX Routes
  run: |
    cd services/user-service/gateway
    ./deploy.sh ${{ secrets.APISIX_ADMIN_URL }} ${{ secrets.APISIX_ADMIN_KEY }}
```

### Individual Route Deployment

```bash
# Deploy only the users route
curl -X PUT http://apisix:9180/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: admin-key-aetherweave" \
  -H "Content-Type: application/json" \
  -d @routes/users.json

# Deploy only the roles route
curl -X PUT http://apisix:9180/apisix/admin/routes/user-service-roles \
  -H "X-API-KEY: admin-key-aetherweave" \
  -H "Content-Type: application/json" \
  -d @routes/roles.json
```

## 📋 Route Configuration Format

Each JSON file follows the [APISIX Admin API Route schema](https://apisix.apache.org/docs/apisix/admin-api/#route):

```json
{
  "id": "unique-route-id",
  "name": "descriptive-route-name",
  "uris": ["/api/v1/resource", "/api/v1/resource/*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "service-name:3500": 1
    }
  },
  "plugins": {
    "openid-connect": { ... },
    "proxy-rewrite": { ... },
    "cors": { ... },
    "zipkin": { ... }
  }
}
```

## 🔄 Updating Routes

### When You Change Backend Endpoints

1. **Modify** the appropriate route file in `routes/`
2. **Test locally** with the development setup
3. **Commit** changes to your service repository
4. **Deploy** via CI/CD pipeline (calls `deploy.sh`)

### Zero-Downtime Updates

APISIX supports hot-reloading. Using `PUT` to update a route applies changes **immediately** without restarting the gateway or affecting other routes.

```bash
# Update a route (changes apply instantly)
curl -X PUT http://apisix:9180/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: admin-key-aetherweave" \
  -d @routes/users.json
```

### Partial Updates with PATCH

For small changes (e.g., adding a header), use `PATCH`:

```bash
curl -X PATCH http://apisix:9180/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: admin-key-aetherweave" \
  -d '{
    "plugins": {
      "cors": {
        "allow_origins": "https://production.example.com"
      }
    }
  }'
```

## 🔍 Verifying Deployment

### Via Admin API

```bash
# List all routes
curl http://apisix:9180/apisix/admin/routes \
  -H "X-API-KEY: admin-key-aetherweave" | jq

# Get specific route
curl http://apisix:9180/apisix/admin/routes/user-service-users \
  -H "X-API-KEY: admin-key-aetherweave" | jq
```

### Via APISIX Dashboard

Access the web UI at http://localhost:9000 (dev) or your production APISIX Dashboard URL.

### Via Actual Requests

```bash
# Test the route works
curl -X GET http://apisix:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ Security Considerations

### Production Secrets

**DO NOT** commit production secrets to Git!

1. **Keycloak client_secret**: Use environment variables or secret management
2. **Admin API key**: Rotate regularly, store in CI/CD secrets
3. **CORS origins**: Restrict to your production domains

### Example with Environment Variables

Modify `routes/users.json` to use placeholders, then substitute in CI/CD:

```json
{
  "plugins": {
    "openid-connect": {
      "client_secret": "${KEYCLOAK_CLIENT_SECRET}"
    }
  }
}
```

Then in CI/CD:
```bash
envsubst < routes/users.json > routes/users.json.tmp
curl -X PUT ... -d @routes/users.json.tmp
```

## 🧪 Testing Routes Locally

While the route configurations are for production Admin API deployment, you can test them locally:

```bash
# Start APISIX in dev mode
cd infrastructure
docker-compose up -d apisix

# Deploy routes to local APISIX
cd ../services/user-service/gateway
./deploy.sh http://localhost:9180 admin-key-aetherweave

# Test endpoints
# See: services/user-service.http
```

## 📚 Additional Resources

- [APISIX Admin API Documentation](https://apisix.apache.org/docs/apisix/admin-api/)
- [Gateway Strategy (AetherWeave)](../../docs/GATEWAY.md)
- [APISIX Deployment Modes](https://apisix.apache.org/docs/apisix/deployment-modes/)
- [API Testing Examples](../user-service.http)

## 🤝 Contributing

When adding new endpoints to user-service:

1. Add backend controller/route
2. Update OpenAPI spec (`backend/src/main.ts`)
3. **Create route config** in `gateway/routes/` if it's a new top-level resource
4. Test locally
5. Deploy via `deploy.sh` in CI/CD

---

**Note**: This setup prepares for the future AetherWeave code generator, which will automatically generate these route configurations alongside backend and frontend code from YAML meta-models.

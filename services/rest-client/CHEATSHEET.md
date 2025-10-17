
# API Cheatsheet - User Service

## 🔐 Authentication

```bash
# Get a JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# Verify the token
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

## 🌐 Via Envoy (API Gateway) - Production-like

```bash
# Health Check
curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"

# List users
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"

# Get a user
curl http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN"

# Create a user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.user@example.com",
    "password": "securePassword123",
    "firstName": "New",
    "lastName": "User"
  }'

# Update a user
curl -X PATCH http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "isActive": true
  }'

# Delete a user
curl -X DELETE http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Via Dapr Direct - Development

```bash
# Health Check
curl http://localhost:3500/v1.0/invoke/user-service/method/health

# List users
curl http://localhost:3500/v1.0/invoke/user-service/method/users

# Get a user
curl http://localhost:3500/v1.0/invoke/user-service/method/users/{id}

# Create a user
curl -X POST http://localhost:3500/v1.0/invoke/user-service/method/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Update a user
curl -X PATCH http://localhost:3500/v1.0/invoke/user-service/method/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }'

# Delete a user
curl -X DELETE http://localhost:3500/v1.0/invoke/user-service/method/users/{id}
```

## 📊 Dapr State Management

```bash
# Save state
curl -X POST http://localhost:3500/v1.0/state/statestore \
  -H "Content-Type: application/json" \
  -d '[
    {
      "key": "user-prefs",
      "value": {
        "theme": "dark",
        "language": "fr"
      }
    }
  ]'

# Retrieve state
curl http://localhost:3500/v1.0/state/statestore/user-prefs

# Delete state
curl -X DELETE http://localhost:3500/v1.0/state/statestore/user-prefs
```

## 🔍 Monitoring & Debug

```bash
# Health Check Envoy
curl http://localhost:8000/health

# Health Check Dapr
curl http://localhost:3500/v1.0/healthz

# Metadata Dapr
curl http://localhost:3500/v1.0/metadata

# Logs Docker
docker logs user-service -f
docker logs user-service-dapr -f
docker logs envoy -f

# Container status
docker ps | grep -E "user-service|envoy|dapr"

# Open ports
netstat -tuln | grep -E "3000|3500|8000"
```

## 🚀 Quick start

```bash
# Start the infrastructure
cd infrastructure
docker-compose up -d

# Start the user-service
cd ../services/user-service
docker-compose up -d

# Verify everything is running
docker ps
docker logs user-service-dapr --tail 20

# Quick test
curl http://localhost:3500/v1.0/invoke/user-service/method/health
```

## 🛑 Arrêt

```bash
# Stop the user-service
cd services/user-service
docker-compose down

# Stop the infrastructure
cd ../../infrastructure
docker-compose down

# Stop everything and remove volumes
docker-compose down -v
```

## 📝 REST Client (VS Code)

1. Open `api-tests.http`
2. Click "Send Request" above each request
3. Or use `Ctrl+Alt+R` (Windows/Linux) / `Cmd+Alt+R` (Mac)

## 🔑 Test users (Keycloak)

| Username | Password | Description |
|----------|----------|-------------|
| `fof` | `password` | Main test user |
| `admin` | `admin` | Keycloak administrator |

## 📌 URLs importantes

| Service | URL | Description |
|---------|-----|-------------|
| API Gateway (Envoy) | http://localhost:8000 | Main entry point |
| Dapr HTTP | http://localhost:3500 | Direct Dapr API |
| User Service | http://localhost:3000 | Direct service (dev) |
| Keycloak | http://localhost:8080 | SSO authentication |
| Grafana | http://localhost:3100 | Dashboards (admin/admin) |
| Prometheus | http://localhost:9090 | Metrics |
| Jaeger | http://localhost:16686 | Distributed tracing |
| RabbitMQ | http://localhost:15672 | Message broker (admin/admin) |
| Envoy Admin | http://localhost:9901 | Envoy admin interface |

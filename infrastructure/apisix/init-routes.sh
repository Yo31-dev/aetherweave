#!/bin/bash

set -e

echo "==================================="
echo "APISIX Route Initialization Script"
echo "==================================="

# Wait for APISIX to be ready
echo "Waiting for APISIX to be ready..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://apisix:9080/health | grep -q "200"; then
    echo "✓ APISIX is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

# Admin API endpoint
ADMIN_API="http://apisix:9180/apisix/admin"
API_KEY="admin-key-aetherweave"

echo ""
echo "==================================="
echo "Creating Routes"
echo "==================================="

# Route 1: User Service - /api/v1/users
echo ""
echo "Creating route: /api/v1/users -> user-service"
curl -i -X PUT "${ADMIN_API}/routes/1" \
  -H "X-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-service-users",
    "uris": ["/api/v1/users", "/api/v1/users/*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
      "openid-connect": {
        "client_id": "aetherweave-api",
        "client_secret": "CHANGE_ME_IN_PRODUCTION",
        "discovery": "http://keycloak:8080/realms/aetherweave/.well-known/openid-configuration",
        "scope": "openid profile email",
        "bearer_only": true,
        "realm": "aetherweave",
        "use_jwks": true,
        "token_signing_alg_values_expected": "RS256"
      },
      "proxy-rewrite": {
        "regex_uri": ["^/api/v1/users(.*)", "/v1.0/invoke/user-service/method/users$1"]
      },
      "cors": {
        "allow_origins": "**",
        "allow_methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "allow_headers": "Authorization,Content-Type,X-Requested-With,X-Dapr-App-Id",
        "expose_headers": "Content-Length,Content-Type",
        "max_age": 86400,
        "allow_credential": true
      },
      "zipkin": {
        "endpoint": "http://jaeger:9411/api/v2/spans",
        "sample_ratio": 1,
        "service_name": "apisix-gateway"
      }
    }
  }'

# Route 2: Health endpoint (public)
echo ""
echo "Creating route: /api/v1/health -> user-service/health"
curl -i -X PUT "${ADMIN_API}/routes/2" \
  -H "X-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-service-health",
    "uri": "/api/v1/health",
    "methods": ["GET"],
    "upstream": {
      "type": "roundrobin",
      "nodes": {
        "user-service:3500": 1
      }
    },
    "plugins": {
      "openid-connect": {
        "client_id": "aetherweave-api",
        "client_secret": "CHANGE_ME_IN_PRODUCTION",
        "discovery": "http://keycloak:8080/realms/aetherweave/.well-known/openid-configuration",
        "scope": "openid profile email",
        "bearer_only": true,
        "realm": "aetherweave",
        "use_jwks": true,
        "token_signing_alg_values_expected": "RS256"
      },
      "proxy-rewrite": {
        "uri": "/v1.0/invoke/user-service/method/health"
      },
      "cors": {
        "allow_origins": "**",
        "allow_methods": "GET,OPTIONS",
        "allow_headers": "Authorization,Content-Type",
        "max_age": 86400
      },
      "zipkin": {
        "endpoint": "http://jaeger:9411/api/v2/spans",
        "sample_ratio": 1,
        "service_name": "apisix-gateway"
      }
    }
  }'

# Route 3: Gateway health check (public, no auth)
echo ""
echo "Creating route: /health -> APISIX health"
curl -i -X PUT "${ADMIN_API}/routes/3" \
  -H "X-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gateway-health",
    "uri": "/health",
    "methods": ["GET"],
    "upstream": {
      "type": "roundrobin",
      "nodes": {
        "apisix:9080": 1
      }
    },
    "plugins": {
      "serverless-pre-function": {
        "phase": "rewrite",
        "functions": [
          "return function(conf, ctx) ngx.say(\"OK\"); ngx.exit(200); end"
        ]
      }
    }
  }'

echo ""
echo "==================================="
echo "✓ Route initialization complete!"
echo "==================================="
echo ""
echo "Routes created:"
echo "  1. POST/GET/PUT/DELETE /api/v1/users/* -> user-service (protected)"
echo "  2. GET /api/v1/health -> user-service/health (protected)"
echo "  3. GET /health -> Gateway health (public)"
echo ""
echo "Access the Dashboard at: http://localhost:9000"
echo "  Username: admin"
echo "  Password: admin"
echo ""

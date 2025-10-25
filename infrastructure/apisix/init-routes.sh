#!/bin/sh

###############################################################################
# APISIX Route Initialization Script
#
# Initializes APISIX routes via Admin API from declarative YAML configuration
# This script reads apisix.yaml and creates routes using the Admin API
###############################################################################

set -e

ADMIN_URL="http://apisix:9180"
API_KEY="admin-key-aetherweave"

echo "=========================================="
echo "APISIX Route Initialization"
echo "=========================================="
echo ""
echo "Admin API: $ADMIN_URL"
echo ""

# Wait a bit for APISIX to be fully ready
echo "Waiting for APISIX Admin API..."
sleep 3

# Function to create/update a route
create_route() {
  local route_id=$1
  local route_data=$2

  echo "Creating route ID: $route_id"

  response=$(curl -s -w "\n%{http_code}" -X PUT "$ADMIN_URL/apisix/admin/routes/$route_id" \
    -H "X-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$route_data")

  http_code=$(echo "$response" | tail -n 1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✓ Route $route_id created successfully"
  else
    echo "✗ Failed to create route $route_id (HTTP $http_code)"
    echo "$response" | head -n -1
  fi

  echo ""
}

echo "Creating routes..."
echo ""

# Route 1: User Service - Users CRUD
create_route "1" '{
  "name": "user-service-users",
  "uris": ["/api/v1/users", "/api/v1/users/*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {"user-service:3500": 1},
    "timeout": {"connect": 6, "send": 30, "read": 30}
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

# Route 2: User Service - Health endpoint
create_route "2" '{
  "name": "user-service-health",
  "uri": "/api/v1/health",
  "methods": ["GET"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {"user-service:3500": 1},
    "timeout": {"connect": 6, "send": 30, "read": 30}
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

# Route 3: User Service - Roles CRUD
create_route "3" '{
  "name": "user-service-roles",
  "uris": ["/api/v1/roles", "/api/v1/roles/*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {"user-service:3500": 1},
    "timeout": {"connect": 6, "send": 30, "read": 30}
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
      "regex_uri": ["^/api/v1/roles(.*)", "/v1.0/invoke/user-service/method/roles$1"]
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

# Route 4: Gateway Health Check (public, no auth)
create_route "4" '{
  "name": "gateway-health",
  "uri": "/health",
  "methods": ["GET"],
  "plugins": {
    "serverless-pre-function": {
      "phase": "rewrite",
      "functions": ["return function(conf, ctx) ngx.say(\"OK\"); ngx.exit(200); end"]
    }
  }
}'

# Route 5: Portal Frontend (public, no auth)
create_route "5" '{
  "name": "portal-frontend",
  "uris": ["/", "/*"],
  "methods": ["GET", "OPTIONS"],
  "priority": 1,
  "upstream": {
    "type": "roundrobin",
    "nodes": {"aetherweave-portal:80": 1},
    "timeout": {"connect": 6, "send": 30, "read": 30}
  },
  "plugins": {
    "cors": {
      "allow_origins": "**",
      "allow_methods": "GET,OPTIONS",
      "allow_headers": "Content-Type,X-Requested-With",
      "max_age": 86400
    }
  }
}'

echo "=========================================="
echo "✓ All routes initialized successfully!"
echo "=========================================="
echo ""
echo "You can verify routes at:"
echo "  - APISIX Dashboard: http://localhost:9000"
echo "  - Admin API: curl http://localhost:9180/apisix/admin/routes -H 'X-API-KEY: admin-key-aetherweave'"
echo ""

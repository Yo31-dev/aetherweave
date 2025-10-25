#!/bin/bash

#################################################################
# APISIX Route Deployment Script
#
# This script deploys user-service routes to APISIX using the
# Admin API in production environments.
#
# Usage:
#   ./deploy.sh [APISIX_ADMIN_URL] [ADMIN_API_KEY]
#
# Example:
#   ./deploy.sh http://apisix:9180 my-secret-key
#################################################################

set -e  # Exit on error

# Configuration
APISIX_ADMIN_URL="${1:-http://localhost:9180}"
ADMIN_API_KEY="${2:-admin-key-aetherweave}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROUTES_DIR="$SCRIPT_DIR/routes"

echo "=========================================="
echo "APISIX Route Deployment - user-service"
echo "=========================================="
echo ""
echo "APISIX Admin URL: $APISIX_ADMIN_URL"
echo "Routes Directory: $ROUTES_DIR"
echo ""

# Function to deploy a single route
deploy_route() {
  local route_file=$1
  local route_name=$(basename "$route_file" .json)

  echo "Deploying route: $route_name"

  # Extract route ID from JSON
  local route_id=$(jq -r '.id' "$route_file")

  # Deploy via Admin API (PUT = create or update)
  curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/routes/$route_id" \
    -H "X-API-KEY: $ADMIN_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$route_file" \
    -s -w "\nHTTP Status: %{http_code}\n"

  echo "✓ Route '$route_name' deployed successfully"
  echo ""
}

# Check if routes directory exists
if [ ! -d "$ROUTES_DIR" ]; then
  echo "Error: Routes directory not found at $ROUTES_DIR"
  exit 1
fi

# Check if APISIX is reachable
echo "Checking APISIX connectivity..."
if ! curl -s -f "$APISIX_ADMIN_URL/apisix/admin/routes" \
  -H "X-API-KEY: $ADMIN_API_KEY" > /dev/null 2>&1; then
  echo "Error: Cannot connect to APISIX Admin API at $APISIX_ADMIN_URL"
  echo "Please check:"
  echo "  1. APISIX is running"
  echo "  2. Admin API URL is correct"
  echo "  3. API key is correct"
  exit 1
fi
echo "✓ APISIX is reachable"
echo ""

# Deploy all route files
echo "Deploying routes..."
echo ""

for route_file in "$ROUTES_DIR"/*.json; do
  if [ -f "$route_file" ]; then
    deploy_route "$route_file"
  fi
done

echo "=========================================="
echo "✓ All routes deployed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Verify routes in APISIX Dashboard: http://localhost:9000"
echo "  2. Test endpoints with: services/user-service.http"
echo ""

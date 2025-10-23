#!/bin/bash

echo "=========================================="
echo "Getting JWT Token from Keycloak"
echo "=========================================="

RESPONSE=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password")

TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✓ Token obtained successfully"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo ""

echo "=========================================="
echo "Testing Envoy (port 8000)"
echo "=========================================="
curl -i http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN" 2>&1 | head -25
echo ""

echo "=========================================="
echo "Testing APISIX (port 9080)"
echo "=========================================="
curl -i http://localhost:9080/api/v1/users/ -H "Authorization: Bearer $TOKEN" 2>&1 | head -25

#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r '.access_token')

echo "=========================================="
echo "Testing APISIX Gateway on port 9080"
echo "=========================================="
echo ""
echo "Token obtained: ${TOKEN:0:50}..."
echo ""

echo "1. Testing /api/v1/users/ with JWT token:"
echo "------------------------------------------"
curl -i http://localhost:9080/api/v1/users/ -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "2. Testing /api/v1/health with JWT token:"
echo "------------------------------------------"
curl -i http://localhost:9080/api/v1/health -H "Authorization: Bearer $TOKEN"

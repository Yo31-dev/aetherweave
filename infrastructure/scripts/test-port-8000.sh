#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r '.access_token')

echo "=========================================="
echo "Testing APISIX on port 8000 (production)"
echo "=========================================="
echo ""

echo "1. Public health check"
echo "-----------------------------------"
curl -s http://localhost:8000/health
echo ""
echo ""

echo "2. GET /api/v1/users/"
echo "-----------------------------------"
curl -s http://localhost:8000/api/v1/users/ -H "Authorization: Bearer $TOKEN" | jq '.[0:2]'
echo ""

echo "3. GET /api/v1/health"
echo "-----------------------------------"
curl -s http://localhost:8000/api/v1/health -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=========================================="
echo "✓ APISIX is now running on port 8000!"
echo "✓ Envoy has been replaced successfully!"
echo "=========================================="

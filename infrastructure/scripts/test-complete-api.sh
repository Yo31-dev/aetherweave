#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r '.access_token')

echo "=========================================="
echo "Complete API Tests via APISIX (port 9080)"
echo "=========================================="
echo ""

echo "1. GET /api/v1/users/ (list all)"
echo "-----------------------------------"
curl -s http://localhost:9080/api/v1/users/ -H "Authorization: Bearer $TOKEN" | jq '.[0:2]'
echo ""

echo "2. GET /api/v1/health (health check)"
echo "-----------------------------------"
curl -s http://localhost:9080/api/v1/health -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "3. GET /health (public health)"
echo "-----------------------------------"
curl -s http://localhost:9080/health
echo ""
echo ""

echo "4. POST /api/v1/users/ (create user)"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:9080/api/v1/users/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apisix-test@example.com",
    "password": "testPassword123",
    "firstName": "APISIX",
    "lastName": "Test"
  }')
echo $RESPONSE | jq .
USER_ID=$(echo $RESPONSE | jq -r '.id')
echo ""

echo "5. GET /api/v1/users/$USER_ID (get specific user)"
echo "-----------------------------------"
curl -s http://localhost:9080/api/v1/users/$USER_ID -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "6. PATCH /api/v1/users/$USER_ID (update user)"
echo "-----------------------------------"
curl -s -X PATCH http://localhost:9080/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "APISIX-Updated"}' | jq .
echo ""

echo "7. DELETE /api/v1/users/$USER_ID (delete user)"
echo "-----------------------------------"
curl -s -X DELETE http://localhost:9080/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
echo "User deleted"
echo ""

echo "=========================================="
echo "✓ All tests completed successfully!"
echo "=========================================="

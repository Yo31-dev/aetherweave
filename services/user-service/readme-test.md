```bash
# Utilisateur fof
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .

curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"
```
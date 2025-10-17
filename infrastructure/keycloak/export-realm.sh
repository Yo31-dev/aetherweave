#!/bin/bash

echo "📤 Export de la configuration Keycloak..."

# Vérifier que Keycloak est accessible
if ! curl -sf http://localhost:8080/health/ready > /dev/null; then
    echo "❌ Keycloak n'est pas accessible"
    exit 1
fi

# Récupérer un token admin
echo "🔑 Authentification admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r .access_token)

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo "❌ Échec de l'authentification admin"
    exit 1
fi

# Exporter le realm
echo "📥 Export du realm microservices..."
REALM_DATA=$(curl -s http://localhost:8080/admin/realms/microservices \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [ -z "$REALM_DATA" ]; then
    echo "❌ Impossible d'exporter le realm"
    exit 1
fi

# Sauvegarder dans un fichier
OUTPUT_FILE="./realms/microservices-realm-backup-$(date +%Y%m%d-%H%M%S).json"
echo "$REALM_DATA" | jq '.' > "$OUTPUT_FILE"

echo "✅ Realm exporté vers: $OUTPUT_FILE"
echo ""
echo "💡 Pour utiliser ce backup:"
echo "  1. Copier vers: ./realms/microservices-realm.json"
echo "  2. Lancer: ./import-realm.sh"
#!/bin/bash

echo "🔐 Import de la configuration Keycloak..."

# Attendre que Keycloak soit prêt
echo "⏳ Attente du démarrage de Keycloak..."
until curl -sf http://localhost:8080/health/ready > /dev/null; do
    echo -n "."
    sleep 2
done
echo " ✅ Keycloak prêt!"

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

echo "✅ Token admin récupéré"

# Vérifier si le realm existe déjà
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:8080/admin/realms/microservices \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [ "$REALM_EXISTS" = "200" ]; then
    echo "⚠️  Le realm 'microservices' existe déjà"
    read -p "Voulez-vous le supprimer et recréer? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Suppression du realm existant..."
        curl -s -X DELETE http://localhost:8080/admin/realms/microservices \
          -H "Authorization: Bearer $ADMIN_TOKEN"
        echo "✅ Realm supprimé"
    else
        echo "⏭️  Import annulé"
        exit 0
    fi
fi

# Importer le realm
echo "📥 Import du realm microservices..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @./realms/microservices-realm.json)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Realm 'microservices' importé avec succès!"
    
    # Récupérer le client secret
    echo ""
    echo "🔑 Récupération du client secret..."
    CLIENT_SECRET=$(curl -s http://localhost:8080/admin/realms/microservices/clients \
      -H "Authorization: Bearer $ADMIN_TOKEN" | \
      jq -r '.[] | select(.clientId=="microservices-api") | .id' | \
      xargs -I {} curl -s http://localhost:8080/admin/realms/microservices/clients/{}/client-secret \
      -H "Authorization: Bearer $ADMIN_TOKEN" | \
      jq -r .value)
    
    echo ""
    echo "✅ Configuration Keycloak terminée!"
    echo ""
    echo "📋 Informations importantes:"
    echo "  Realm: microservices"
    echo "  Client ID: microservices-api"
    echo "  Client Secret: $CLIENT_SECRET"
    echo ""
    echo "👤 Utilisateurs créés:"
    echo "  - admin / admin (rôle: admin)"
    echo "  - fof / password (rôle: user)"
    echo ""
    echo "💡 Mettre à jour le secret dans:"
    echo "  - dapr/secrets/secrets.json"
    echo "  - .env files de tes services"
    
else
    echo "❌ Échec de l'import (HTTP $HTTP_CODE)"
    echo "$RESPONSE" | head -n-1
    exit 1
fi

# API Cheatsheet - User Service

## 🔐 Authentication

```bash
# Get a JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# Verify the token
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

## 🌐 Via Envoy (API Gateway) - Production-like

```bash
# Health Check
curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"

# Lister les utilisateurs
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"

# Obtenir un utilisateur
curl http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN"

# Créer un utilisateur
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.user@example.com",
    "password": "securePassword123",
    "firstName": "New",
    "lastName": "User"
  }'

# Modifier un utilisateur
curl -X PATCH http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "isActive": true
  }'

# Supprimer un utilisateur
curl -X DELETE http://localhost:8000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Via Dapr Direct - Développement

```bash
# Health Check
curl http://localhost:3500/v1.0/invoke/user-service/method/health

# Lister les utilisateurs
curl http://localhost:3500/v1.0/invoke/user-service/method/users

# Obtenir un utilisateur
curl http://localhost:3500/v1.0/invoke/user-service/method/users/{id}

# Créer un utilisateur
curl -X POST http://localhost:3500/v1.0/invoke/user-service/method/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Modifier un utilisateur
curl -X PATCH http://localhost:3500/v1.0/invoke/user-service/method/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }'

# Supprimer un utilisateur
curl -X DELETE http://localhost:3500/v1.0/invoke/user-service/method/users/{id}
```

## 📊 Dapr State Management

```bash
# Sauvegarder un état
curl -X POST http://localhost:3500/v1.0/state/statestore \
  -H "Content-Type: application/json" \
  -d '[
    {
      "key": "user-prefs",
      "value": {
        "theme": "dark",
        "language": "fr"
      }
    }
  ]'

# Récupérer un état
curl http://localhost:3500/v1.0/state/statestore/user-prefs

# Supprimer un état
curl -X DELETE http://localhost:3500/v1.0/state/statestore/user-prefs
```

## 🔍 Monitoring & Debug

```bash
# Health Check Envoy
curl http://localhost:8000/health

# Health Check Dapr
curl http://localhost:3500/v1.0/healthz

# Metadata Dapr
curl http://localhost:3500/v1.0/metadata

# Logs Docker
docker logs user-service -f
docker logs user-service-dapr -f
docker logs envoy -f

# Status des conteneurs
docker ps | grep -E "user-service|envoy|dapr"

# Ports ouverts
netstat -tuln | grep -E "3000|3500|8000"
```

## 🚀 Démarrage rapide

```bash
# Démarrer l'infrastructure
cd infrastructure
docker-compose up -d

# Démarrer le user-service
cd ../services/user-service
docker-compose up -d

# Vérifier que tout fonctionne
docker ps
docker logs user-service-dapr --tail 20

# Test rapide
curl http://localhost:3500/v1.0/invoke/user-service/method/health
```

## 🛑 Arrêt

```bash
# Arrêter le user-service
cd services/user-service
docker-compose down

# Arrêter l'infrastructure
cd ../../infrastructure
docker-compose down

# Tout arrêter et supprimer les volumes
docker-compose down -v
```

## 📝 REST Client (VS Code)

1. Ouvrir `api-tests.http`
2. Cliquer sur "Envoyer la requête" au-dessus de chaque requête
3. Ou utiliser `Ctrl+Alt+R` (Windows/Linux) / `Cmd+Alt+R` (Mac)

## 🔑 Utilisateurs de test (Keycloak)

| Username | Password | Description |
|----------|----------|-------------|
| `fof` | `password` | Utilisateur de test principal |
| `admin` | `admin` | Administrateur Keycloak |

## 📌 URLs importantes

| Service | URL | Description |
|---------|-----|-------------|
| API Gateway (Envoy) | http://localhost:8000 | Point d'entrée principal |
| Dapr HTTP | http://localhost:3500 | API Dapr directe |
| User Service | http://localhost:3000 | Service direct (dev) |
| Keycloak | http://localhost:8080 | Authentification SSO |
| Grafana | http://localhost:3100 | Dashboards (admin/admin) |
| Prometheus | http://localhost:9090 | Métriques |
| Jaeger | http://localhost:16686 | Tracing distribué |
| RabbitMQ | http://localhost:15672 | Message broker (admin/admin) |
| Envoy Admin | http://localhost:9901 | Interface admin Envoy |

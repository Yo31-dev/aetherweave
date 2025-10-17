# User Service

User management service for AetherWeave.

## Local development

```bash
# Install dependencies
pnpm install

# Start in dev mode
pnpm run start:dev

# Build
pnpm run build

# Start in production
pnpm run start:prod
```

## Docker

```bash
# Build the image
docker build -t user-service .

# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f user-service
```

## API Endpoints

### Health Check (public)
- GET `/health` - Health check

### Users (requires JWT)
- GET `/users` - List all users
- GET `/users/:id` - Récupère un utilisateur
- POST `/users` - Crée un utilisateur
- DELETE `/users/:id` - Supprime un utilisateur

## OpenAPI Documentation

Disponible sur `http://localhost:3000/api`

## Tests

### Tests API avec REST Client (VS Code)

Le projet inclut une configuration complète pour tester l'API avec l'extension REST Client de VS Code.

📁 **Fichiers de test** :
- `api-tests.http` - Toutes les requêtes API
- `API_TESTING.md` - Documentation complète
- `API_RESPONSES.md` - Exemples de réponses
- `.vscode/rest-client.env.json` - Variables d'environnement

**Utilisation rapide** :
1. Ouvrez `api-tests.http` dans VS Code
2. Cliquez sur "Envoyer la requête" au-dessus d'une requête
3. Consultez `API_TESTING.md` pour plus de détails

### Tests en ligne de commande

#### Sans JWT (health check)
```bash
curl http://localhost:3000/health
```

#### Via Envoy (API Gateway) + JWT
```bash
# 1. Obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# 2. Tester l'API
curl http://localhost:8000/api/v1/health -H "Authorization: Bearer $TOKEN"
curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

#### Via Dapr sidecar (développement)
```bash
# Health check via Dapr
curl http://localhost:3500/v1.0/invoke/user-service/method/health

# Créer un utilisateur
curl -X POST http://localhost:3500/v1.0/invoke/user-service/method/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Lister les utilisateurs
curl http://localhost:3500/v1.0/invoke/user-service/method/users
```

## Variables d'environnement

- `PORT` - Port du service (default: 3000)
- `DB_HOST` - Hôte PostgreSQL (default: postgres)
- `DB_PORT` - Port PostgreSQL (default: 5432)
- `DB_USER` - User PostgreSQL (default: devuser)
- `DB_PASSWORD` - Password PostgreSQL (default: devpassword)
- `DB_NAME` - Nom de la base (default: microservices)
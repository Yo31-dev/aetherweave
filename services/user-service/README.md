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
- GET `/users/:id` - Retrieve a user
- POST `/users` - Create a user
- DELETE `/users/:id` - Delete a user

## OpenAPI Documentation

Available at `http://localhost:3000/api`

## Tests

### API Tests with REST Client (VS Code)

The project includes a complete setup to test the API with the REST Client VS Code extension.

📁 **Test files** :
- `api-tests.http` - All API requests
- `API_TESTING.md` - Full documentation
- `API_RESPONSES.md` - Response examples
- `.vscode/rest-client.env.json` - Environment variables

**Utilisation rapide** :
1. Ouvrez `api-tests.http` dans VS Code
2. Cliquez sur "Envoyer la requête" au-dessus d'une requête
3. Consultez `API_TESTING.md` pour plus de détails

### Command-line tests

#### Without JWT (health check)
```bash
curl http://localhost:3000/health
```

#### Via Envoy (API Gateway) + JWT
```bash
# 1. Obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# 2. Tester l'API
curl http://localhost:8000/api/v1/health -H "Authorization: Bearer $TOKEN"
curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

#### Via Dapr sidecar (development)
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
- `DB_NAME` - Nom de la base (default: aetherweave)
# User Service

Service de gestion des utilisateurs pour AetherWeave.

## Développement local

```bash
# Installer les dépendances
pnpm install

# Lancer en mode dev
pnpm run start:dev

# Build
pnpm run build

# Lancer en prod
pnpm run start:prod
```

## Docker

```bash
# Build l'image
docker build -t user-service .

# Lancer avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f user-service
```

## API Endpoints

### Health Check (public)
- GET `/health` - Health check

### Users (nécessite JWT)
- GET `/users` - Liste tous les utilisateurs
- GET `/users/:id` - Récupère un utilisateur
- POST `/users` - Crée un utilisateur
- DELETE `/users/:id` - Supprime un utilisateur

## OpenAPI Documentation

Disponible sur `http://localhost:3000/api`

## Tests

### Sans JWT (health check)
```bash
curl http://localhost:3000/health
```

### Via Dapr sidecar
```bash
# Health check via Dapr
curl http://localhost:3500/v1.0/invoke/user-service/method/health

# Créer un utilisateur
curl -X POST http://localhost:3500/v1.0/invoke/user-service/method/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'

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
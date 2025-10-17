# Exemples de Réponses API

Ce fichier contient des exemples de réponses pour chaque endpoint de l'API.

## Authentification

### POST /realms/microservices/protocol/openid-connect/token

**Succès (200)** :
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxV...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scope": "email profile"
}
```

**Erreur (401)** :
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid user credentials"
}
```

---

## Health Check

### GET /api/v1/health

**Succès (200)** :
```json
{
  "status": "ok",
  "service": "user-service",
  "timestamp": "2025-10-17T12:20:27.973Z"
}
```

---

## Utilisateurs

### GET /api/v1/users

**Succès (200)** :
```json
[
  {
    "id": "b141fde9-1127-4561-9fd2-cd17992bc9cf",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2025-10-17T11:09:07.249Z",
    "updatedAt": "2025-10-17T11:09:07.249Z"
  },
  {
    "id": "c252ged0-2238-5672-0ge3-de28003cd0cg",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isActive": true,
    "createdAt": "2025-10-17T12:15:30.123Z",
    "updatedAt": "2025-10-17T12:15:30.123Z"
  }
]
```

**Liste vide (200)** :
```json
[]
```

---

### GET /api/v1/users/:id

**Succès (200)** :
```json
{
  "id": "b141fde9-1127-4561-9fd2-cd17992bc9cf",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2025-10-17T11:09:07.249Z",
  "updatedAt": "2025-10-17T11:09:07.249Z"
}
```

**Erreur - Utilisateur introuvable (404)** :
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### POST /api/v1/users

**Requête** :
```json
{
  "email": "jane.smith@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Succès (201)** :
```json
{
  "id": "c252ged0-2238-5672-0ge3-de28003cd0cg",
  "email": "jane.smith@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": true,
  "createdAt": "2025-10-17T12:15:30.123Z",
  "updatedAt": "2025-10-17T12:15:30.123Z"
}
```

**Erreur - Email déjà utilisé (409)** :
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

**Erreur - Validation (400)** :
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

---

### PATCH /api/v1/users/:id

**Requête** :
```json
{
  "firstName": "Janet",
  "lastName": "Smith-Jones",
  "isActive": true
}
```

**Succès (200)** :
```json
{
  "id": "c252ged0-2238-5672-0ge3-de28003cd0cg",
  "email": "jane.smith@example.com",
  "firstName": "Janet",
  "lastName": "Smith-Jones",
  "isActive": true,
  "createdAt": "2025-10-17T12:15:30.123Z",
  "updatedAt": "2025-10-17T12:45:15.789Z"
}
```

**Erreur - Utilisateur introuvable (404)** :
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### DELETE /api/v1/users/:id

**Succès (204)** :
```
(Pas de contenu)
```

**Erreur - Utilisateur introuvable (404)** :
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

## Erreurs d'Authentification

### Sans token

**Erreur (401)** :
```json
{
  "statusCode": 401,
  "message": "Jwt is missing"
}
```

Ou (selon la configuration Envoy) :
```
Jwt is missing
```

### Token invalide ou expiré

**Erreur (401)** :
```
Jwt verification fails
```

---

## Dapr Endpoints

### GET /v1.0/healthz

**Succès (204)** :
```
(Pas de contenu - juste status 204)
```

---

### GET /v1.0/metadata

**Succès (200)** :
```json
{
  "id": "user-service",
  "actors": [],
  "components": [
    {
      "name": "statestore",
      "type": "state.redis",
      "version": "v1"
    },
    {
      "name": "pubsub",
      "type": "pubsub.rabbitmq",
      "version": "v1"
    },
    {
      "name": "local-secret-store",
      "type": "secretstores.local.file",
      "version": "v1"
    }
  ],
  "extended": {
    "daprRuntimeVersion": "1.12.0",
    "appConnectionProperties": {
      "port": 3000,
      "protocol": "http"
    }
  }
}
```

---

## Dapr State Management

### POST /v1.0/state/statestore

**Requête** :
```json
[
  {
    "key": "user-preferences-fof",
    "value": {
      "theme": "dark",
      "language": "fr"
    }
  }
]
```

**Succès (204)** :
```
(Pas de contenu)
```

---

### GET /v1.0/state/statestore/:key

**Succès (200)** :
```json
{
  "theme": "dark",
  "language": "fr"
}
```

**Erreur - Clé inexistante (204)** :
```
(Pas de contenu)
```

---

### DELETE /v1.0/state/statestore/:key

**Succès (204)** :
```
(Pas de contenu)
```

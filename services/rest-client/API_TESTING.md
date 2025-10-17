
# API Tests - User Service

This folder contains API test files for the User Service using the REST Client extension for VS Code.

## 📋 Prerequisites

### Installing the REST Client extension

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **REST Client** (by Huachao Mao)
4. Click **Install**

Or install via command line:
```bash
code --install-extension humao.rest-client
```

## 📁 Files

- **`api-tests.http`** : Main file containing all API tests
- **`.vscode/rest-client.env.json`** : Environment variables for different environments (dev, staging, prod)

## 🚀 Usage

### 1. Start the infrastructure

Make sure all services are running:

```bash
# Infrastructure (depuis /infrastructure)
cd infrastructure
docker-compose up -d

# User Service (depuis /services/user-service)
cd services/user-service
docker-compose up -d
```

### 2. Open the test file
 
Open the `api-tests.http` file in VS Code.

### 3. Execute the requests

#### Method 1: Click "Send Request"
Above each HTTP request you'll see a **"Send Request"** link. Click it to execute the request.

#### Method 2: Keyboard shortcut
- Place your cursor on the request
- Press `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

### 4. Recommended test workflow

1. **Obtain a JWT token** (Section 1)
   ```http
   POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token
   ```
   The token will be automatically stored in the `@token` variable

2. **Test the health check** (Section 2)
   ```http
   GET http://localhost:8000/api/v1/health
   ```

3. **List users** (Section 2)
   ```http
   GET http://localhost:8000/api/v1/users
   ```

4. **Create, update, delete** users (Section 2)

## 🔧 Environment configuration

The `.vscode/rest-client.env.json` file defines different environments.

### Switch environment

1. Open the `api-tests.http` file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type **"Rest Client: Switch Environment"**
4. Select the desired environment (development, staging, production)

### Available environments

- **development** : Local environment (default)
 - **staging** : Pre-production environment
 - **production** : Production environment

## 📝 Available variables

The following variables are defined in `api-tests.http`:

| Variable | Description | Exemple |
|----------|-------------|---------|
| `@baseUrl` | API Gateway URL (Envoy) | `http://localhost:8000` |
| `@daprUrl` | Direct Dapr URL | `http://localhost:3500` |
| `@keycloakUrl` | Keycloak URL | `http://localhost:8080` |
| `@realm` | Keycloak realm | `aetherweave` |
| `@clientId` | OAuth client ID | `aetherweave-api` |
| `@clientSecret` | OAuth client secret | `CHANGE_ME_IN_PRODUCTION` |
| `@username` | Test user | `fof` |
| `@password` | Password | `password` |
| `@token` | JWT token (auto-extracted) | *(dynamic)* |

## 🧪 Test sections

- **Obtain JWT token**
 - Obtaining the JWT token
 - Token verification

- **With JWT authentication**
 - **With JWT authentication**
- Health check
 - User CRUD (Create, Read, Update, Delete)

- **Without authentication** (for development only)
 - Direct access to endpoints via the Dapr sidecar

### 4. Error tests
- Requests without token (401)
- Invalid token (401)
- Non-existent resources (404)
- Conflicts (409)

### 5. Health Checks Infrastructure
- Check service health
- Dapr metadata

### 6. Dapr State Management
- Save state
- Retrieve state
- Delete state

# 💡 Tips

### View formatted response
JSON responses are automatically formatted. You can:
- Click the "Response" tab to view the result
- Use `Ctrl+Alt+F` to format the JSON

### Save responses
Right-click the response → "Save Response" to save it to a file.

### Use dynamic variables
REST Client supporte des variables dynamiques :
- `{{$guid}}` : Génère un UUID
- `{{$randomInt}}` : Génère un nombre aléatoire
- `{{$timestamp}}` : Timestamp actuel

Exemple :
```http
POST http://localhost:8000/api/v1/users
Content-Type: application/json

{
  "email": "user-{{$timestamp}}@example.com",
  "password": "password123"
}
```

### Chain requests
Use `# @name` to name a request and retrieve its values:

```http
# @name createUser
POST http://localhost:8000/api/v1/users
...

### Use the created user's ID
@userId = {{createUser.response.body.id}}
GET http://localhost:8000/api/v1/users/{{userId}}
```

## 🔒 Security

⚠️ **Important** : 
- Never commit production secrets to Git
- Add `.vscode/rest-client.env.json` to `.gitignore` if you store real secrets there
- Use system environment variables for sensitive secrets

## 📚 REST Client documentation

For more information on REST Client:
- [Documentation officielle](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [GitHub Repository](https://github.com/Huachao/vscode-restclient)

## 🆘 Troubleshooting

### Requests not working
1. Check that all Docker services are started
2. Check the logs: `docker logs user-service`, `docker logs envoy`, etc.
3. Make sure you have obtained a valid token before authenticated requests

### 401 Unauthorized
- Verify that the JWT token is valid
- Retry the authentication request to obtain a new token
- Ensure Keycloak is running

### Connection error
- Check that ports are exposed (8000, 3500, 8080)
- Check with `docker ps` that the containers are running

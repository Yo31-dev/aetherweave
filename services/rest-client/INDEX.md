# API Documentation - Index

Welcome to the complete documentation for the AetherWeave User Service API!

## Quick Start

1. **[REST Client Installation](INSTALL_REST_CLIENT.md)** - Install the VS Code extension
2. **[Cheatsheet](CHEATSHEET.md)** - Quick and essential commands
3. **[Test file](api-tests.http)** - Open and click "Send Request"

## Full Documentation

### Practical Guides

| File | Description | For whom? |
| :-- | :-- | :-- |
| **[README.md](README.md)** | Service overview | Everyone |
| **[Cheatsheet](CHEATSHEET.md)** | Quick commands and URLs | Daily developers |
| **[API_TESTING.md](API_TESTING.md)** | Complete API test guide | New developers |
| **[API_RESPONSES.md](API_RESPONSES.md)** | Response examples | API integration |
| **[INSTALL_REST_CLIENT.md](INSTALL_REST_CLIENT.md)** | Extension installation | Initial setup |

### Test files

| Fichier | Type | Description |
| :-- | :-- | :-- |
| **[api-tests.http](api-tests.http)** | REST Client | Tests API complets et interactifs |
| **[.vscode/rest-client.env.json](.vscode/rest-client.env.json)** | Config | Variables d'environnement (dev/staging/prod) |
| **[.vscode/settings.json](.vscode/settings.json)** | Config | Configuration REST Client |
| **[.vscode/http.code-snippets](.vscode/http.code-snippets)** | Snippets | Raccourcis de code HTTP |

## Use Cases

### I want to quickly test the API

→ Open **[api-tests.http](api-tests.http)** and click "Send Request"

### I am looking for a cURL command

→ See **[CHEATSHEET.md](CHEATSHEET.md)**

### I want to understand how to configure tests

→ Read **[API_TESTING.md](API_TESTING.md)**

### I need to document the API for a client

→ Refer to **[API_RESPONSES.md](API_RESPONSES.md)**

### I don't have REST Client installed

→ Follow **[INSTALL_REST_CLIENT.md](INSTALL_REST_CLIENT.md)**

## Essential Information

### Base URLs

```
API Gateway (Envoy) : http://localhost:8000
Dapr Direct         : http://localhost:3500
User Service        : http://localhost:3000
Keycloak            : http://localhost:8080
```


### Authentication

```bash
# [translate:Utilisateur de test]
Username: fof
Password: password
Client ID: aetherweave-api
```


### Typical workflow

```
1. Get a JWT token (Keycloak)
   ↓
2. Test via Envoy (API Gateway + Auth)
   ↓
3. Check logs if needed
   ↓
4. Test directly via Dapr (debug)
```


## File structure

```
services/user-service/
├── api-tests.http              # Main test file
├── README.md                   # Overview
├── API_TESTING.md              # Complete guide
├── API_RESPONSES.md            # Response examples
├── CHEATSHEET.md               # Cheatsheet
├── INSTALL_REST_CLIENT.md      # Installation
├── INDEX.md                    # This file
└── .vscode/
    ├── rest-client.env.json    # Environment variables
    ├── settings.json           # REST Client configuration
    └── http.code-snippets      # HTTP snippets
```


## Additional Tools

- **Postman** : [Export to Postman](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)
- **cURL** : All commands in CHEATSHEET.md
- **Swagger/OpenAPI** : `http://localhost:3000/api` (if configured)


## Tips

### REST Client shortcuts

- `Ctrl+Alt+R` : Run the request
- `Ctrl+Alt+L` : Re-run last request
- `Ctrl+Alt+K` : Cancel request


### Change environment

1. `Ctrl+Shift+P`
2. Type "Rest Client: Switch Environment"
3. Select dev/staging/prod

### Dynamic variables

```http
# [translate:UUID aléatoire]
{{$guid}}


# Timestamp
{{$timestamp}}


# [translate:Nombre aléatoire]
{{$randomInt}}
```


## Troubleshooting

### Issue: Request blocked or timeout

Make sure Docker services are running: `docker ps`

### Issue: 401 Unauthorized

Get a new JWT token (they expire after 5 minutes)

### Issue: Connection refused

Check ports: `netstat -tuln | grep -E "3000|3500|8000"`

### Issue: REST Client not working

Check installation: `code --list-extensions | grep rest-client`

## Support

- **Dapr Documentation** : [https://docs.dapr.io](https://docs.dapr.io)
- **Envoy Documentation** : [https://www.envoyproxy.io/docs](https://www.envoyproxy.io/docs)
- **REST Client Documentation** : [https://github.com/Huachao/vscode-restclient](https://github.com/Huachao/vscode-restclient)
- **GitHub Issues** : [Your GitHub repo]


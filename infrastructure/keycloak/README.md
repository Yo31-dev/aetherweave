# Automated Keycloak Configuration

## Structure

```
keycloak/
├── realms/
│   └── microservices-realm.json    # Realm config to import
├── import-realm.sh                  # Import script
├── export-realm.sh                  # Export/backup script
└── README.md
```


## Usage

### Automatic import at startup

The configuration is automatically imported at the first startup of Keycloak thanks to the volume mounted in docker-compose.

### Manual import

If you want to re-import or update the config:

```bash
cd infrastructure/keycloak
chmod +x import-realm.sh
./import-realm.sh
```

The script will:

1. Wait for Keycloak to be ready
2. Authenticate as admin
3. Check if the realm already exists
4. Import/recreate the realm
5. Display the generated client secret

### Export your current config

To backup your current Keycloak config:

```bash
cd infrastructure/keycloak
chmod +x export-realm.sh
./export-realm.sh
```

This will create a file `microservices-realm-backup-YYYYMMDD-HHMMSS.json`

## Default configuration

### Realm

- **Name**: `microservices`
- **SSL**: Disabled (dev only)
- **Token lifetime**: 5 minutes
- **SSO session**: 30 minutes


### Client

- **Client ID**: `microservices-api`
- **Client Secret**: `CHANGE_ME_IN_PRODUCTION` (to change)
- **Protocol**: OpenID Connect
- **Access Types**: Confidential
- **Flows**: Standard Flow + Direct Access Grants
- **Redirect URIs**: `http://localhost:*`
- **Web Origins**: `*`


### Configured Mappers

- **audience-mapper**: Adds `microservices-api` into the token audience
- **username-mapper**: Maps username to `preferred_username`
- **email-mapper**: Maps email


### Default Users

1. **admin / admin**
   - Email: [admin@example.com](mailto:admin@example.com)
   - Roles: admin, user
2. **fof / password**
   - Email: [fof@example.com](mailto:fof@example.com)
   - Roles: user

### Roles

- **user**: Standard user role
- **admin**: Administrator role


## Security

### For production

1. **Change the client secret** in `microservices-realm.json`
2. **Change users’ passwords**
3. **Enable SSL** (`sslRequired: "external"`)
4. **Reduce token lifetimes**
5. **Restrict redirect URIs**
6. **Properly configure CORS**

### Generate a new client secret

```bash
# Using OpenSSL
openssl rand -base64 32


# Or using uuidgen
uuidgen | tr -d '-'
```

Then update in:

- `keycloak/realms/microservices-realm.json`
- `dapr/secrets/secrets.json`


## Configuration testing

### Get a token

```bash
 # User fof
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)


echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .


curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"
```


### Decode the token

```bash
 # Show the payload
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .


 # Check the audience
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .aud


 # Check the roles
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .realm_access.roles
```


### Test with Envoy

```bash
curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"
```


## Customization

### Add a user

Edit `microservices-realm.json` in the `users` section:

```json
{
  "username": "newuser",
  "enabled": true,
  "emailVerified": true,
  "email": "newuser@example.com",
  "credentials": [
    {
      "type": "password",
      "value": "password",
      "temporary": false
    }
  ],
  "realmRoles": ["user"]
}
```


### Add a role

In the `roles.realm` section:

```json
{
  "name": "developer",
  "description": "Developer role",
  "composite": false
}
```


### Modify token lifetimes

```json
{
  "accessTokenLifespan": 300,           // 5 minutes
  "ssoSessionIdleTimeout": 1800,        // 30 minutes
  "ssoSessionMaxLifespan": 36000        // 10 hours
}
```


## Useful links

- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [Realm Export/Import](https://www.keycloak.org/server/importExport)
- [OpenID Connect](https://openid.net/connect/)



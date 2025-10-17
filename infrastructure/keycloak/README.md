# Configuration Keycloak Automatisée

## 📁 Structure

```
keycloak/
├── realms/
│   └── microservices-realm.json    # Config du realm à importer
├── import-realm.sh                  # Script d'import
├── export-realm.sh                  # Script d'export/backup
└── README.md
```

## 🚀 Utilisation

### Import automatique au démarrage

La configuration est automatiquement importée au premier démarrage de Keycloak grâce au volume monté dans docker-compose.

### Import manuel

Si tu veux réimporter ou mettre à jour la config :

```bash
cd infrastructure/keycloak
chmod +x import-realm.sh
./import-realm.sh
```

Le script va :
1. Attendre que Keycloak soit prêt
2. S'authentifier comme admin
3. Vérifier si le realm existe déjà
4. Importer/recréer le realm
5. Afficher le client secret généré

### Export de ta config actuelle

Pour sauvegarder ta config Keycloak actuelle :

```bash
cd infrastructure/keycloak
chmod +x export-realm.sh
./export-realm.sh
```

Cela créera un fichier `microservices-realm-backup-YYYYMMDD-HHMMSS.json`

## 🔧 Configuration par défaut

### Realm
- **Nom**: `microservices`
- **SSL**: Désactivé (dev uniquement)
- **Token lifetime**: 5 minutes
- **SSO session**: 30 minutes

### Client
- **Client ID**: `microservices-api`
- **Client Secret**: `CHANGE_ME_IN_PRODUCTION` (à modifier)
- **Protocol**: OpenID Connect
- **Access Types**: Confidential
- **Flows**: Standard Flow + Direct Access Grants
- **Redirect URIs**: `http://localhost:*`
- **Web Origins**: `*`

### Mappers configurés
- **audience-mapper**: Ajoute `microservices-api` dans l'audience du token
- **username-mapper**: Mappe le username dans `preferred_username`
- **email-mapper**: Mappe l'email

### Utilisateurs par défaut
1. **admin / admin**
   - Email: admin@example.com
   - Rôles: admin, user
   
2. **fof / password**
   - Email: fof@example.com
   - Rôles: user

### Rôles
- **user**: Rôle utilisateur standard
- **admin**: Rôle administrateur

## 🔐 Sécurité

### ⚠️ Pour la production

1. **Changer le client secret** dans `microservices-realm.json`
2. **Changer les mots de passe** des utilisateurs
3. **Activer SSL** (`sslRequired: "external"`)
4. **Réduire les token lifetimes**
5. **Restreindre les redirect URIs**
6. **Configurer CORS** correctement

### Générer un nouveau client secret

```bash
# Avec OpenSSL
openssl rand -base64 32

# Ou avec uuidgen
uuidgen | tr -d '-'
```

Puis mettre à jour dans :
- `keycloak/realms/microservices-realm.json`
- `dapr/secrets/secrets.json`

## 🧪 Test de la configuration

### Obtenir un token

```bash
# Utilisateur fof
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

### Décoder le token

```bash
# Afficher le payload
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .

# Vérifier l'audience
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .aud

# Vérifier les rôles
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .realm_access.roles
```

### Tester avec Envoy

```bash
curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Personnalisation

### Ajouter un utilisateur

Éditer `microservices-realm.json`, dans la section `users` :

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

### Ajouter un rôle

Dans la section `roles.realm` :

```json
{
  "name": "developer",
  "description": "Developer role",
  "composite": false
}
```

### Modifier les token lifetimes

```json
{
  "accessTokenLifespan": 300,           // 5 minutes
  "ssoSessionIdleTimeout": 1800,        // 30 minutes
  "ssoSessionMaxLifespan": 36000        // 10 heures
}
```

## 🔗 Liens utiles

- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [Realm Export/Import](https://www.keycloak.org/server/importExport)
- [OpenID Connect](https://openid.net/connect/)
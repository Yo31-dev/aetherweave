
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

- **`api-tests.http`** : Fichier principal contenant tous les tests API
- **`.vscode/rest-client.env.json`** : Variables d'environnement pour différents environnements (dev, staging, prod)

## 🚀 Utilisation

### 1. Démarrer l'infrastructure

Assurez-vous que tous les services sont démarrés :

```bash
# Infrastructure (depuis /infrastructure)
cd infrastructure
docker-compose up -d

# User Service (depuis /services/user-service)
cd services/user-service
docker-compose up -d
```

### 2. Ouvrir le fichier de tests

Ouvrez le fichier `api-tests.http` dans VS Code.

### 3. Exécuter les requêtes

#### Méthode 1 : Cliquer sur "Envoyer la requête"
Au-dessus de chaque requête HTTP, vous verrez un lien **"Envoyer la requête"**. Cliquez dessus pour exécuter la requête.

#### Méthode 2 : Raccourci clavier
- Placez votre curseur sur la requête
- Appuyez sur `Ctrl+Alt+R` (Windows/Linux) ou `Cmd+Alt+R` (Mac)

### 4. Workflow de test recommandé

1. **Obtenir un token JWT** (Section 1)
   ```http
   POST http://localhost:8080/realms/microservices/protocol/openid-connect/token
   ```
   Le token sera automatiquement stocké dans la variable `@token`

2. **Tester le health check** (Section 2)
   ```http
   GET http://localhost:8000/api/v1/health
   ```

3. **Lister les utilisateurs** (Section 2)
   ```http
   GET http://localhost:8000/api/v1/users
   ```

4. **Créer, modifier, supprimer** des utilisateurs (Section 2)

## 🔧 Configuration des environnements

Le fichier `.vscode/rest-client.env.json` permet de définir différents environnements.

### Changer d'environnement

1. Ouvrez le fichier `api-tests.http`
2. Appuyez sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
3. Tapez **"Rest Client: Switch Environment"**
4. Sélectionnez l'environnement souhaité (development, staging, production)

### Environnements disponibles

- **development** : Environnement local (par défaut)
- **staging** : Environnement de pré-production
- **production** : Environnement de production

## 📝 Variables disponibles

Les variables suivantes sont définies dans `api-tests.http` :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `@baseUrl` | URL de l'API Gateway (Envoy) | `http://localhost:8000` |
| `@daprUrl` | URL directe de Dapr | `http://localhost:3500` |
| `@keycloakUrl` | URL de Keycloak | `http://localhost:8080` |
| `@realm` | Realm Keycloak | `microservices` |
| `@clientId` | Client ID OAuth | `microservices-api` |
| `@clientSecret` | Client Secret OAuth | `CHANGE_ME_IN_PRODUCTION` |
| `@username` | Utilisateur de test | `fof` |
| `@password` | Mot de passe | `password` |
| `@token` | Token JWT (auto-extrait) | *(dynamique)* |

## 🧪 Sections de tests

### 1. Authentification Keycloak
- Obtention du token JWT
- Vérification du token

### 2. Tests via Envoy (API Gateway)
- **Avec authentification JWT**
- Health check
- CRUD utilisateurs (Create, Read, Update, Delete)

### 3. Tests directs via Dapr
- **Sans authentification** (pour le développement uniquement)
- Accès direct aux endpoints via le sidecar Dapr

### 4. Tests d'erreurs
- Requêtes sans token (401)
- Token invalide (401)
- Ressources inexistantes (404)
- Conflits (409)

### 5. Health Checks Infrastructure
- Vérification de l'état des services
- Metadata Dapr

### 6. Dapr State Management
- Sauvegarde d'état
- Récupération d'état
- Suppression d'état

## 💡 Astuces

### Voir la réponse formatée
Les réponses JSON sont automatiquement formatées. Vous pouvez :
- Cliquer sur l'onglet "Response" pour voir le résultat
- Utiliser `Ctrl+Alt+F` pour formater le JSON

### Sauvegarder des réponses
Faites un clic droit sur la réponse → "Save Response" pour sauvegarder dans un fichier.

### Utiliser des variables dynamiques
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

### Chaîner les requêtes
Utilisez `# @name` pour nommer une requête et récupérer ses valeurs :

```http
# @name createUser
POST http://localhost:8000/api/v1/users
...

### Utiliser l'ID de l'utilisateur créé
@userId = {{createUser.response.body.id}}
GET http://localhost:8000/api/v1/users/{{userId}}
```

## 🔒 Sécurité

⚠️ **Important** : 
- Ne committez **JAMAIS** les secrets de production dans Git
- Ajoutez `.vscode/rest-client.env.json` au `.gitignore` si vous y stockez des secrets réels
- Utilisez des variables d'environnement système pour les secrets sensibles

## 📚 Documentation REST Client

Pour plus d'informations sur REST Client :
- [Documentation officielle](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [GitHub Repository](https://github.com/Huachao/vscode-restclient)

## 🆘 Dépannage

### Les requêtes ne fonctionnent pas
1. Vérifiez que tous les services Docker sont démarrés
2. Vérifiez les logs : `docker logs user-service`, `docker logs envoy`, etc.
3. Assurez-vous d'avoir obtenu un token valide avant les requêtes authentifiées

### Erreur 401 Unauthorized
- Vérifiez que le token JWT est valide
- Relancez la requête d'authentification pour obtenir un nouveau token
- Vérifiez que Keycloak est bien démarré

### Erreur de connexion
- Vérifiez que les ports sont bien exposés (8000, 3500, 8080)
- Vérifiez avec `docker ps` que les conteneurs sont en cours d'exécution

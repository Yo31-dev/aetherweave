# 📚 Documentation API - Index

Bienvenue dans la documentation complète de l'API User Service d'AetherWeave !

## 🚀 Démarrage rapide

1. **[Installation REST Client](INSTALL_REST_CLIENT.md)** - Installer l'extension VS Code
2. **[Cheatsheet](CHEATSHEET.md)** - Commandes rapides et essentielles
3. **[Fichier de tests](api-tests.http)** - Ouvrir et cliquer sur "Send Request"

## 📖 Documentation complète

### Guides pratiques

| Fichier | Description | Pour qui ? |
|---------|-------------|-----------|
| **[README.md](README.md)** | Vue d'ensemble du service | Tout le monde |
| **[CHEATSHEET.md](CHEATSHEET.md)** | Commandes rapides et URLs | Développeurs quotidiens |
| **[API_TESTING.md](API_TESTING.md)** | Guide complet des tests API | Nouveaux développeurs |
| **[API_RESPONSES.md](API_RESPONSES.md)** | Exemples de réponses | Intégration API |
| **[INSTALL_REST_CLIENT.md](INSTALL_REST_CLIENT.md)** | Installation de l'extension | Configuration initiale |

### Fichiers de test

| Fichier | Type | Description |
|---------|------|-------------|
| **[api-tests.http](api-tests.http)** | REST Client | Tests API complets et interactifs |
| **[.vscode/rest-client.env.json](.vscode/rest-client.env.json)** | Config | Variables d'environnement (dev/staging/prod) |
| **[.vscode/settings.json](.vscode/settings.json)** | Config | Configuration REST Client |
| **[.vscode/http.code-snippets](.vscode/http.code-snippets)** | Snippets | Raccourcis de code HTTP |

## 🎯 Cas d'usage

### Je veux tester rapidement l'API
→ Ouvrez **[api-tests.http](api-tests.http)** et cliquez sur "Send Request"

### Je cherche une commande cURL
→ Consultez **[CHEATSHEET.md](CHEATSHEET.md)**

### Je veux comprendre comment configurer les tests
→ Lisez **[API_TESTING.md](API_TESTING.md)**

### Je dois documenter l'API pour un client
→ Référez-vous à **[API_RESPONSES.md](API_RESPONSES.md)**

### Je n'ai pas REST Client installé
→ Suivez **[INSTALL_REST_CLIENT.md](INSTALL_REST_CLIENT.md)**

## 🔑 Informations essentielles

### URLs de base

```
API Gateway (Envoy) : http://localhost:8000
Dapr Direct         : http://localhost:3500
User Service        : http://localhost:3000
Keycloak            : http://localhost:8080
```

### Authentification

```bash
# Utilisateur de test
Username: fof
Password: password
Client ID: microservices-api
```

### Workflow typique

```
1. Obtenir un token JWT (Keycloak)
   ↓
2. Tester via Envoy (API Gateway + Auth)
   ↓
3. Vérifier les logs si nécessaire
   ↓
4. Tester directement via Dapr (debug)
```

## 📁 Structure des fichiers

```
services/user-service/
├── api-tests.http              # ⭐ Fichier principal de tests
├── README.md                   # Vue d'ensemble
├── API_TESTING.md              # Guide complet
├── API_RESPONSES.md            # Exemples de réponses
├── CHEATSHEET.md               # Aide-mémoire
├── INSTALL_REST_CLIENT.md      # Installation
├── INDEX.md                    # Ce fichier
└── .vscode/
    ├── rest-client.env.json    # Variables d'environnement
    ├── settings.json           # Configuration REST Client
    └── http.code-snippets      # Snippets HTTP
```

## 🛠️ Outils complémentaires

- **Postman** : [Exporter vers Postman](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)
- **cURL** : Toutes les commandes dans CHEATSHEET.md
- **Swagger/OpenAPI** : `http://localhost:3000/api` (si configuré)

## 💡 Astuces

### Raccourcis REST Client
- `Ctrl+Alt+R` : Exécuter la requête
- `Ctrl+Alt+L` : Re-exécuter la dernière requête
- `Ctrl+Alt+K` : Annuler la requête

### Changer d'environnement
1. `Ctrl+Shift+P`
2. Tapez "Rest Client: Switch Environment"
3. Sélectionnez dev/staging/prod

### Variables dynamiques
```http
# UUID aléatoire
{{$guid}}

# Timestamp
{{$timestamp}}

# Nombre aléatoire
{{$randomInt}}
```

## 🐛 Dépannage

### Problème : Requête bloquée ou timeout
✅ Vérifiez que les services Docker sont démarrés : `docker ps`

### Problème : 401 Unauthorized
✅ Obtenez un nouveau token JWT (ils expirent après 5 minutes)

### Problème : Connection refused
✅ Vérifiez les ports : `netstat -tuln | grep -E "3000|3500|8000"`

### Problème : REST Client ne fonctionne pas
✅ Vérifiez l'installation : `code --list-extensions | grep rest-client`

## 📞 Support

- **Documentation Dapr** : https://docs.dapr.io
- **Documentation Envoy** : https://www.envoyproxy.io/docs
- **Documentation REST Client** : https://github.com/Huachao/vscode-restclient
- **Issues GitHub** : [Votre repo GitHub]

## 📝 Contribution

Pour améliorer cette documentation :
1. Proposez vos modifications
2. Testez les exemples
3. Ouvrez une PR

---

**Dernière mise à jour** : 17 octobre 2025  
**Version API** : v1  
**Auteur** : Équipe AetherWeave

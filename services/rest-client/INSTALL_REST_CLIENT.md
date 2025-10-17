# Installation de REST Client

## Méthode 1 : Via l'interface VS Code

1. Ouvrez VS Code
2. Cliquez sur l'icône **Extensions** dans la barre latérale (ou appuyez sur `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Recherchez **"REST Client"** (par Huachao Mao)
4. Cliquez sur **Install**

![REST Client Extension](https://raw.githubusercontent.com/Huachao/vscode-restclient/master/images/usage.gif)

## Méthode 2 : Via la ligne de commande

```bash
code --install-extension humao.rest-client
```

## Méthode 3 : Depuis le Marketplace

Visitez : [REST Client sur VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Vérification de l'installation

```bash
code --list-extensions | grep humao.rest-client
```

Si l'extension est installée, vous verrez :
```
humao.rest-client
```

## Utilisation après installation

1. Ouvrez le fichier `api-tests.http`
2. Vous verrez des liens **"Send Request"** au-dessus de chaque requête HTTP
3. Cliquez sur ces liens pour exécuter les requêtes

## Raccourcis clavier

- **Exécuter la requête** : `Ctrl+Alt+R` (Windows/Linux) ou `Cmd+Alt+R` (Mac)
- **Annuler la requête** : `Ctrl+Alt+K` (Windows/Linux) ou `Cmd+Alt+K` (Mac)
- **Ré-exécuter la dernière requête** : `Ctrl+Alt+L` (Windows/Linux) ou `Cmd+Alt+L` (Mac)

## Fonctionnalités principales

✅ **Syntaxe simple** : Écrivez vos requêtes HTTP en texte brut  
✅ **Variables** : Utilisez `@variable = value` pour définir des variables  
✅ **Environnements** : Gérez plusieurs environnements (dev, staging, prod)  
✅ **Chaînage** : Récupérez des valeurs de réponse pour les requêtes suivantes  
✅ **Authentification** : Support OAuth2, JWT, Basic Auth, etc.  
✅ **Historique** : Consultez l'historique de vos requêtes  
✅ **Export** : Générez du code cURL, JavaScript, Python, etc.

## Alternative : Utiliser cURL

Si vous préférez ne pas installer l'extension, vous pouvez utiliser les commandes du fichier `CHEATSHEET.md` avec cURL.

```bash
# Exemple
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

## Autres alternatives

- **Postman** : Application dédiée pour les tests API
- **Insomnia** : Alternative légère à Postman
- **HTTPie** : Client HTTP en ligne de commande moderne
- **Thunder Client** : Extension VS Code alternative

Mais **REST Client** est recommandé car :
- ✅ Intégré dans VS Code
- ✅ Fichiers versionnés avec Git
- ✅ Léger et rapide
- ✅ Pas besoin de compte externe
- ✅ Fonctionne offline

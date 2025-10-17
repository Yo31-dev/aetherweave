# REST Client Installation

## Method 1: Via VS Code interface

1. Open VS Code
2. Click the **Extensions** icon in the sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **"REST Client"** (by Huachao Mao)
4. Click **Install**

![REST Client Extension](https://raw.githubusercontent.com/Huachao/vscode-restclient/master/images/usage.gif)

## Method 2: Via command line

```bash
code --install-extension humao.rest-client
```

````markdown
# REST Client Installation

## Method 1: Via VS Code interface

1. Open VS Code
2. Click the **Extensions** icon in the sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **"REST Client"** (by Huachao Mao)
4. Click **Install**

![REST Client Extension](https://raw.githubusercontent.com/Huachao/vscode-restclient/master/images/usage.gif)

## Method 2: Via command line

```bash
code --install-extension humao.rest-client
```

## Method 3: From the Marketplace

Visit: [REST Client on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Installation verification

```bash
code --list-extensions | grep humao.rest-client
```

If the extension is installed, you will see:
```
humao.rest-client
```

## Using after installation

1. Open the file `api-tests.http`
2. You will see **"Send Request"** links above each HTTP request
3. Click these links to execute the requests

## Keyboard shortcuts

- **Run Request**: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)
- **Cancel Request**: `Ctrl+Alt+K` (Windows/Linux) or `Cmd+Alt+K` (Mac)
- **Re-run Last Request**: `Ctrl+Alt+L` (Windows/Linux) or `Cmd+Alt+L` (Mac)

## Key features

**Simple syntax**: Write your HTTP requests in plain text  
**Variables**: Use `@variable = value` to define variables  
**Environments**: Manage multiple environments (dev, staging, prod)  
**Chaining**: Retrieve response values for subsequent requests  
**Authentication**: Supports OAuth2, JWT, Basic Auth, etc.  
**History**: View your request history  
**Export**: Generate cURL, JavaScript, Python code, etc.

## Alternative: Use cURL

If you prefer not to install the extension, you can use the commands from the `CHEATSHEET.md` file with cURL.

```bash
# Example
TOKEN=$(curl -s -X POST http://localhost:8080/realms/aetherweave/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=aetherweave-api" \
  -d "client_secret=CHANGE_ME_IN_PRODUCTION" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

curl http://localhost:8000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

## Other alternatives

- **Postman**: Dedicated application for API testing
- **Insomnia**: Lightweight alternative to Postman
- **HTTPie**: Modern command-line HTTP client
- **Thunder Client**: Alternate VS Code extension

But **REST Client** is recommended because:
- Integrated into VS Code
- Files versioned with Git
- Lightweight and fast
- No external account required
- Works offline

````

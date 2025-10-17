# AetherWeave 

tissage d'architecture micro-services
# Environnement de Développement - Stack Micro-services

## 📋 Prérequis
## 🏗️ Architecture

```
### Services Infrastructure

## 🔍 URLs Utiles
## 🧪 Tests

### Tester Envoy Gateway
## 📊 Observabilité

### Grafana Dashboards
## 🛠️ Commandes Utiles

## 🐛 Troubleshooting
## 📝 Étapes suivantes

1. ✅ Configuration initiale de Keycloak
2. ⏳ Générer ton premier service backend
3. ⏳ Tester la communication inter-services via Dapr
4. ⏳ Ajouter un frontend web component
5. ⏳ Configurer le CI/CD
# AetherWeave 

tissage d'architecture micro-services

# Environnement de Développement - Stack Micro-services

## 📋 Prérequis

- Windows 11 avec WSL2
- Docker Desktop configuré avec WSL2 backend
- Git

## 🏗️ Architecture

```
┌─────────────┐
│   Envoy     │ ← API Gateway + JWT validation
│  Gateway    │
└──────┬──────┘
       │
       ├─────→ Dapr Sidecars ──→ Services Backend
       │
       └─────→ Frontend (Nginx)
```

### Services Infrastructure

- **Envoy**: API Gateway CNCF avec validation JWT Keycloak
- **Dapr**: Runtime pour service invocation, pub/sub, state management
- **PostgreSQL**: Base de données principale
- **Redis**: State store Dapr + cache
- **RabbitMQ**: Message broker pour pub/sub
- **Keycloak**: SSO provider (OpenID Connect)

### Observabilité

- **Jaeger**: Tracing distribué
- **Prometheus**: Collecte de métriques
- **Grafana**: Dashboards et visualisation

## 🚀 Démarrage Rapide

### 1. Cloner et configurer

```bash
# Structure des dossiers (automatique avec setup script)
./setup-dev-env.sh
```

### 2. Démarrer l'environnement

```bash
docker-compose up -d
```

### 3. Vérifier l'état

```bash
docker-compose ps
docker-compose logs -f
```

## 🔑 Configuration Keycloak (Première fois)

### Créer le Realm

1. Accéder à http://localhost:8080
2. Login: `admin` / `admin`
3. Créer un nouveau realm: `microservices`

### Créer le Client

1. Dans le realm `microservices`, aller dans **Clients**
2. Créer un nouveau client:
   - Client ID: `microservices-api`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:*`
   - Web Origins: `*`
3. Dans l'onglet **Credentials**, copier le **Secret**
4. Mettre à jour `dapr/secrets/secrets.json` avec ce secret

### Créer un utilisateur de test

1. Dans **Users**, créer un nouvel utilisateur
2. Définir un mot de passe dans l'onglet **Credentials**

fof@fof.com / password

### Obtenir un token JWT (test)

```bash
curl -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=YOUR_USER" \
  -d "password=YOUR_PASSWORD" \
  -d "grant_type=password"
```

## 📦 Ajouter un Service

### Structure d'un service avec Dapr

```yaml
# Dans docker-compose.yml
my-service:
  build: ./services/my-service
  container_name: my-service
  environment:
    DATABASE_URL: postgresql://devuser:devpassword@postgres:5432/microservices
  networks:
    - microservices-net

my-service-dapr:
  image: daprio/daprd:1.12.0
  container_name: my-service-dapr
  command: [
    "./daprd",
    "-app-id", "my-service",
    "-app-port", "3000",
    "-dapr-http-port", "3500",
    "-dapr-grpc-port", "50001",
    "-placement-host-address", "dapr-placement:50006",
    "-components-path", "/components",
    "-config", "/config/config.yaml"
  ]
  volumes:
    - ./dapr/components:/components
    - ./dapr/config:/config
  depends_on:
    - my-service
    - dapr-placement
  network_mode: "service:my-service"
```

### Appeler un service depuis un autre

```typescript
// Via Dapr service invocation
const response = await fetch('http://localhost:3500/v1.0/invoke/target-service/method/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Publier un message

```typescript
// Via Dapr pub/sub
await fetch('http://localhost:3500/v1.0/publish/pubsub/order-created', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: '123', amount: 99.99 })
});
```

## 🔍 URLs Utiles

| Service | URL | Credentials |
|---------|-----|-------------|
| Keycloak Admin | http://localhost:8080 | admin / admin |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| Envoy Gateway | http://localhost:8000 | - |
| Envoy Admin | http://localhost:9901 | - |
| Jaeger UI | http://localhost:16686 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin / admin |
| PostgreSQL | localhost:5432 | devuser / devpassword |
| Redis | localhost:6379 | - |

## 🧪 Tests

### Tester Envoy Gateway

```bash
# Sans authentification (doit échouer)
curl http://localhost:8000/api/v1/health

# Avec JWT token
curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Tester Dapr directement

```bash
# Health check
curl http://localhost:3500/v1.0/healthz

# Invoke service
curl http://localhost:3500/v1.0/invoke/my-service/method/health
```

## 📊 Observabilité

### Grafana Dashboards

1. Accéder à http://localhost:3000
2. Login: `admin` / `admin`
3. Importer des dashboards:
   - Dapr Dashboard: ID `14454`
   - RabbitMQ: ID `10991`
   - PostgreSQL: ID `9628`

### Jaeger Tracing

1. Accéder à http://localhost:16686
2. Sélectionner un service dans le dropdown
3. Rechercher des traces

## 🛠️ Commandes Utiles

```bash
# Démarrer l'environnement
docker-compose up -d

# Arrêter l'environnement
docker-compose down

# Arrêter et supprimer les volumes (reset complet)
docker-compose down -v

# Voir les logs
docker-compose logs -f [service-name]

# Reconstruire un service
docker-compose up -d --build [service-name]

# Redémarrer un service
docker-compose restart [service-name]

# Exécuter une commande dans un container
docker-compose exec [service-name] sh
```

## 🐛 Troubleshooting

### Keycloak ne démarre pas

```bash
# Vérifier les logs
docker-compose logs keycloak

# Supprimer le volume et recréer
docker-compose down -v
docker-compose up -d
```

### Dapr sidecar ne communique pas

```bash
# Vérifier que le placement service est UP
docker-compose ps dapr-placement

# Vérifier les logs du sidecar
docker-compose logs my-service-dapr
```

### Envoy retourne 503

```bash
# Vérifier la configuration
docker-compose exec envoy cat /etc/envoy/envoy.yaml

# Vérifier l'admin interface
curl http://localhost:9901/clusters
curl http://localhost:9901/config_dump
```

## 📝 Étapes suivantes

1. ✅ Configuration initiale de Keycloak
2. ⏳ Générer ton premier service backend
3. ⏳ Tester la communication inter-services via Dapr
4. ⏳ Ajouter un frontend web component
5. ⏳ Configurer le CI/CD

## 🔗 Documentation

- [Dapr Docs](https://docs.dapr.io)
- [Envoy Proxy](https://www.envoyproxy.io/docs)
- [Keycloak](https://www.keycloak.org/documentation)
- [RabbitMQ](https://www.rabbitmq.com/documentation.html)
- [Jaeger](https://www.jaegertracing.io/docs)
- [Grafana](https://grafana.com/docs)


```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=microservices-api" \
  -d "client_secret=udp7QXqWfFqwDagEooIeDPDQm48bmHLj" \
  -d "username=fof" \
  -d "password=password" \
  -d "grant_type=password" | jq -r .access_token)

# Extraire et afficher l'audience du JWT
echo "$TOKEN" | cut -d '.' -f2 | base64 -d 2>/dev/null | jq .aud

curl http://localhost:8000/api/v1/health \
  -H "Authorization: Bearer $TOKEN"
```



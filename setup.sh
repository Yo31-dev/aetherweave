#!/bin/bash

echo "🚀 Configuration de l'environnement de développement..."



# Vérification que les fichiers de config existent
echo "✅ Vérification des fichiers de configuration..."

required_files=(
    "docker-compose.yml"
    "envoy/envoy.yaml"
    "dapr/config/config.yaml"
    "dapr/components/statestore.yaml"
    "dapr/components/pubsub.yaml"
    "dapr/components/secrets.yaml"
    "dapr/secrets/secrets.json"
    "prometheus/prometheus.yml"
    "grafana/provisioning/datasources/datasources.yaml"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Fichiers manquants:"
    printf '%s\n' "${missing_files[@]}"
    echo ""
    echo "Veuillez créer ces fichiers avant de continuer."
    exit 1
fi

echo "✅ Tous les fichiers de configuration sont présents"

# Démarrage des services
echo ""
echo "🐳 Démarrage de Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

# Vérification de l'état des services
echo ""
echo "🔍 Vérification de l'état des services..."
docker-compose ps

echo ""
echo "✅ Environnement de développement prêt!"
echo ""
echo "📊 URLs des services:"
echo "  - Keycloak Admin:     http://localhost:8080 (admin/admin)"
echo "  - RabbitMQ Management: http://localhost:15672 (admin/admin)"
echo "  - Envoy Gateway:      http://localhost:8000"
echo "  - Envoy Admin:        http://localhost:9901"
echo "  - Jaeger UI:          http://localhost:16686"
echo "  - Prometheus:         http://localhost:9090"
echo "  - Grafana:            http://localhost:3000 (admin/admin)"
echo ""
echo "💡 Prochaines étapes:"
echo "  1. Configurer un realm 'aetherweave' dans Keycloak"
echo "  2. Créer un client 'aetherweave-api' dans Keycloak"
echo "  3. Déployer ton premier service généré"
echo ""
echo "Pour arrêter l'environnement: docker-compose down"
echo "Pour voir les logs: docker-compose logs -f [service-name]"
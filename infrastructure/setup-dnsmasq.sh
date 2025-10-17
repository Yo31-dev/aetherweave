#!/bin/bash

echo "🌐 Configuration de dnsmasq pour WSL2..."

# Vérifier qu'on est sur WSL
if ! grep -qi microsoft /proc/version; then
    echo "❌ Ce script doit être exécuté dans WSL2"
    exit 1
fi

# Installer dnsmasq si nécessaire
if ! command -v dnsmasq &> /dev/null; then
    echo "📦 Installation de dnsmasq..."
    sudo apt update
    sudo apt install -y dnsmasq
fi

# Arrêter le service systemd si actif
echo "🛑 Arrêt du service dnsmasq systemd..."
sudo systemctl stop dnsmasq 2>/dev/null || true
sudo systemctl disable dnsmasq 2>/dev/null || true

# Copier la config dnsmasq
echo "📝 Configuration de dnsmasq..."
sudo mkdir -p /etc/dnsmasq.d
sudo cp dnsmasq/dnsmasq.conf /etc/dnsmasq.d/aetherweave.conf

# Configurer WSL2 pour ne pas régénérer resolv.conf automatiquement
echo "⚙️  Configuration de WSL2..."
sudo tee /etc/wsl.conf > /dev/null << 'EOF'
[network]
generateResolvConf = false
EOF

# Backup de resolv.conf existant
if [ -f /etc/resolv.conf ] && [ ! -L /etc/resolv.conf ]; then
    sudo cp /etc/resolv.conf /etc/resolv.conf.backup
fi

# Configurer resolv.conf pour pointer vers dnsmasq
echo "🔧 Configuration de resolv.conf..."
sudo rm -f /etc/resolv.conf
sudo tee /etc/resolv.conf > /dev/null << 'EOF'
# Configuration pour dnsmasq local
nameserver 127.0.0.1

# Fallback DNS (Google)
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF

# Protéger resolv.conf contre l'écrasement
sudo chattr +i /etc/resolv.conf 2>/dev/null || true

# Démarrer dnsmasq en tant que service
echo "🚀 Démarrage de dnsmasq..."
sudo dnsmasq -C /etc/dnsmasq.d/aetherweave.conf

# Vérifier que dnsmasq tourne
if pgrep -x dnsmasq > /dev/null; then
    echo "✅ dnsmasq démarré avec succès!"
else
    echo "❌ Erreur lors du démarrage de dnsmasq"
    exit 1
fi

# Tester la résolution DNS
echo ""
echo "🧪 Test de résolution DNS..."
if nslookup idp.aetherweave.local 127.0.0.1 > /dev/null 2>&1; then
    echo "✅ idp.aetherweave.local → 127.0.0.1"
else
    echo "❌ Échec de la résolution DNS"
    exit 1
fi

if nslookup google.com 127.0.0.1 > /dev/null 2>&1; then
    echo "✅ google.com → résolution externe OK"
else
    echo "⚠️  Résolution DNS externe en échec"
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 Domaines configurés:"
echo "  - *.aetherweave.local → 127.0.0.1"
echo ""
echo "🌐 Services accessibles:"
echo "  - http://idp.aetherweave.local (Keycloak)"
echo "  - http://gateway.aetherweave.local (Traefik Dashboard)"
echo "  - http://api.aetherweave.local (API Gateway)"
echo "  - http://api.docs.aetherweave.local (API Documentation)"
echo "  - http://monitoring.aetherweave.local (Grafana)"
echo "  - http://tracing.aetherweave.local (Jaeger)"
echo "  - http://metrics.aetherweave.local (Prometheus)"
echo "  - http://broker.aetherweave.local (RabbitMQ)"
echo ""
echo "⚠️  IMPORTANT: Redémarrer WSL2 pour appliquer tous les changements:"
echo "  - Fermer tous les terminaux WSL"
echo "  - Dans PowerShell: wsl --shutdown"
echo "  - Rouvrir WSL"
echo ""
echo "💡 Pour démarrer dnsmasq au boot, ajouter dans ~/.bashrc:"
echo "   sudo dnsmasq -C /etc/dnsmasq.d/aetherweave.conf 2>/dev/null || true"
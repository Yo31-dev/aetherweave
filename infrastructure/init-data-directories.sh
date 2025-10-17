#!/bin/bash

# Script to create data directory structure with proper Linux permissions
# Run from the infrastructure directory
# run as SUDO 

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"

echo "Creating data directory structure in: $DATA_DIR"

# Create main data directory
mkdir -p "$DATA_DIR"
chmod 755 "$DATA_DIR"

# Create service directories
mkdir -p "$DATA_DIR/postgres"
mkdir -p "$DATA_DIR/redis"
mkdir -p "$DATA_DIR/rabbitmq"
mkdir -p "$DATA_DIR/prometheus"
mkdir -p "$DATA_DIR/grafana"
mkdir -p "$DATA_DIR/keycloak"
mkdir -p "$DATA_DIR/dapr"
mkdir -p "$DATA_DIR/envoy"

# Set permissions recursively
chmod -R 777 "$DATA_DIR"

# Ensure full permissions for Grafana specifically
chmod -R 777 "$DATA_DIR/grafana"

echo "Done. Data directories created in $DATA_DIR"
ls -la "$DATA_DIR"

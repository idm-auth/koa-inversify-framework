#!/bin/sh
set -e

echo "Verificando rede dev-network..."
docker network inspect dev-network >/dev/null 2>&1 || {
  echo "Criando rede dev-network..."
  docker network create dev-network
}
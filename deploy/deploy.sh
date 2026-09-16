#!/usr/bin/env bash
#
# Deploy do backend na VPS. Roda como o usuario `deploy`, a partir da raiz do
# repositorio clonado em /home/deploy/cripto-curitiba.
#
# Uso: ./deploy/deploy.sh
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

echo "==> Atualizando o codigo"
git pull --ff-only origin main

echo "==> Instalando dependencias"
pnpm install --frozen-lockfile

echo "==> Aplicando migrations"
pnpm --filter @cripto/db exec prisma migrate deploy

echo "==> Compilando"
pnpm --filter @cripto/db build
pnpm --filter @cripto/shared build
pnpm --filter @cripto/api build

echo "==> Recarregando o processo"
if pm2 describe criptocuritiba-api > /dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --update-env
else
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
fi

echo "==> Conferindo a saude"
sleep 3
curl -fsS http://127.0.0.1:3333/api/v1/health > /dev/null
echo "Deploy concluido."

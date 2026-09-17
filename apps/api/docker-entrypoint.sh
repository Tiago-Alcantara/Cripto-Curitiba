#!/bin/sh
# Boot da API no container: migrations e depois o servidor.
#
# Aplicar migration no boot funciona porque roda uma instancia so. Com mais de
# uma, mover para o "Pre-deployment Command" do Coolify, que roda uma vez.
set -e

echo "==> aplicando migrations"
pnpm --filter @cripto/db exec prisma migrate deploy

echo "==> subindo a API em ${HOST:-0.0.0.0}:${PORT:-3333}"
exec node apps/api/dist/server.js

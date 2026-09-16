#!/usr/bin/env bash
#
# Backup diario do Postgres. Instalar no cron do root:
#   0 3 * * * /home/deploy/cripto-curitiba/deploy/backup.sh >> /var/log/backup-criptocuritiba.log 2>&1
#
# Backup que nunca foi restaurado nao e backup: teste a restauracao antes do
# lancamento (docs/06-infra-e-deploy.md).
set -euo pipefail

BANCO="${BANCO:-criptocuritiba_prod}"
DESTINO="${DESTINO:-/var/backups/postgres}"
RETENCAO_DIAS="${RETENCAO_DIAS:-7}"

mkdir -p "$DESTINO"
ARQUIVO="$DESTINO/$(date +%F-%H%M).dump.gz"

echo "[$(date -Is)] iniciando backup de $BANCO"
sudo -u postgres pg_dump -Fc "$BANCO" | gzip > "$ARQUIVO"
echo "[$(date -Is)] gerado $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"

# Copia offsite: o unico backup nao pode viver na mesma maquina que o banco.
if [ -n "${RCLONE_DESTINO:-}" ]; then
  rclone copy "$ARQUIVO" "$RCLONE_DESTINO"
  echo "[$(date -Is)] copiado para $RCLONE_DESTINO"
else
  echo "[$(date -Is)] AVISO: RCLONE_DESTINO nao definido, backup so local"
fi

find "$DESTINO" -name '*.dump.gz' -mtime "+$RETENCAO_DIAS" -delete

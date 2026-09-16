# 06 — Infra e deploy

## Topologia

| Componente | Onde | Como |
|---|---|---|
| Next.js | Vercel | build automático no push da branch `main` |
| Fastify | VPS do usuário | PM2 (cluster desligado, 1 instância), porta `127.0.0.1:3333` |
| PostgreSQL | mesma VPS | `listen_addresses = 'localhost'` |
| TLS + proxy | mesma VPS | Caddy (certificado automático) |
| Uploads | disco da VPS | `/var/www/criptocuritiba/uploads`, servido pelo Caddy |

Sem Docker por enquanto ([ADR-0003](adr/0003-sem-docker.md)).

## Domínios

| Host | Aponta para |
|---|---|
| `criptocuritiba.com.br` | Vercel |
| `www` | redirect 301 para o apex |
| `api.criptocuritiba.com.br` | IP da VPS (A record) |

O frontend **precisa** rodar no domínio próprio (não em `*.vercel.app`) para que o
cookie de sessão do admin funcione entre `criptocuritiba.com.br` e
`api.criptocuritiba.com.br` com `SameSite=Lax`.

## Preparo da VPS (uma vez)

1. Usuário não-root `deploy`, SSH só por chave, senha e root login desativados
2. UFW: permitir 22, 80, 443; negar o resto
3. `fail2ban` no sshd
4. Node 22 LTS via `nvm` ou nodesource; `corepack enable` para o pnpm
5. PostgreSQL 16: `createuser criptocuritiba`, `createdb criptocuritiba_prod`, senha forte, acesso só local
6. `npm i -g pm2 && pm2 startup && pm2 install pm2-logrotate`
7. Caddy via pacote oficial
8. Timezone `America/Sao_Paulo`, `unattended-upgrades` ligado

### Caddyfile

```
api.criptocuritiba.com.br {
    encode gzip zstd

    handle /uploads/* {
        root * /var/www/criptocuritiba
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
    }

    handle {
        reverse_proxy 127.0.0.1:3333
    }

    log {
        output file /var/log/caddy/api.log
    }
}
```

### ecosystem.config.cjs (PM2)

```js
module.exports = {
  apps: [{
    name: 'criptocuritiba-api',
    cwd: '/home/deploy/cripto-curitiba/apps/api',
    script: 'dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '400M',
    env: { NODE_ENV: 'production', PORT: 3333, HOST: '127.0.0.1' },
  }],
};
```

## Variáveis de ambiente

### `apps/api/.env`

```
NODE_ENV=production
PORT=3333
HOST=127.0.0.1
DATABASE_URL=postgresql://criptocuritiba:***@localhost:5432/criptocuritiba_prod
SESSION_SECRET=            # 32+ bytes aleatórios
COOKIE_DOMAIN=.criptocuritiba.com.br
CORS_ORIGINS=https://criptocuritiba.com.br,http://localhost:3000
FRONTEND_URL=https://criptocuritiba.com.br
REVALIDATE_SECRET=
TURNSTILE_SECRET_KEY=
UPLOADS_DIR=/var/www/criptocuritiba/uploads
PUBLIC_UPLOADS_URL=https://api.criptocuritiba.com.br/uploads
ADMIN_SEED_PASSWORD=       # só no primeiro seed
```

### `apps/web/.env` (Vercel)

```
NEXT_PUBLIC_API_URL=https://api.criptocuritiba.com.br/api/v1
NEXT_PUBLIC_SITE_URL=https://criptocuritiba.com.br
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
REVALIDATE_SECRET=
```

`.env.example` versionado em cada app; `.env` no `.gitignore` desde o primeiro commit.

## Deploy

**Frontend:** push na `main` → build automático na Vercel. Preview por PR.

**Backend:** script `scripts/deploy.sh` executado por SSH:

```bash
set -euo pipefail
cd /home/deploy/cripto-curitiba
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm --filter @cripto/db prisma migrate deploy
pnpm --filter @cripto/api build
pm2 reload criptocuritiba-api --update-env
```

CI (GitHub Actions):

- **em PR:** `lint`, `typecheck`, `test`, `build` dos dois apps
- **em push na `main`:** o job acima + deploy do backend via SSH
  (`appleboy/ssh-action` com `SSH_KEY`/`SSH_HOST`/`SSH_USER` em secrets)

Deploy do backend só entra na Fase 5; até lá, deploy manual por SSH é suficiente.

## Backups

- `pg_dump` diário às 03:00 via cron, comprimido, em `/var/backups/postgres`
- Retenção: 7 diários + 4 semanais
- Cópia offsite com `rclone` para um bucket (R2/B2) — **não** deixar o único backup
  na mesma máquina que o banco
- **Restore testado uma vez antes do lançamento.** Backup não testado não é backup.

```bash
0 3 * * * pg_dump -Fc criptocuritiba_prod | gzip > /var/backups/postgres/$(date +\%F).dump.gz
```

## Runbook rápido

| Sintoma | Primeiro passo |
|---|---|
| Site fora, API fora | `pm2 status`, `pm2 logs criptocuritiba-api --lines 200` |
| 502 no Caddy | API caiu ou porta errada: `curl localhost:3333/api/v1/health` |
| Certificado expirado | `systemctl status caddy`, `journalctl -u caddy` |
| Banco não conecta | `systemctl status postgresql`, checar `DATABASE_URL` |
| Disco cheio | logs do PM2 e uploads; conferir `pm2-logrotate` |
| Site no ar com dado velho | revalidação falhou; `POST /api/revalidate` manual |

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
| `cripto-curitiba.vercel.app` | Frontend (domínio gratuito da Vercel) |
| `criptocuritiba-api.duckdns.org` | IP da VPS (A record no DuckDNS) |

O frontend usa o domínio da Vercel ([ADR-0009](adr/0009-dominio-vercel-app.md)). A
API ainda precisa de hostname próprio: a página é HTTPS e o browser bloqueia
chamada HTTP (mixed content), então é preciso certificado — e certificado precisa
de nome. O subdomínio DuckDNS é gratuito e o Caddy emite o certificado por HTTP-01
sem configuração extra.

Setup do DuckDNS: criar o subdomínio, apontar para o IP da VPS e deixar um cron de
atualização (`curl "https://www.duckdns.org/update?domains=...&token=..."`) a cada
5 minutos, caso o IP da VPS não seja estático.

A autenticação do admin **não depende do domínio** ([ADR-0006](adr/0006-auth-admin.md)):
o token fica em cookie first-party na origem da Vercel, gravado pelo BFF do Next.
Migrar para um domínio próprio depois é troca de variável de ambiente.

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
criptocuritiba-api.duckdns.org {
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
JWT_SECRET=            # 32+ bytes; trocar invalida todas as sessões
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://cripto-curitiba.vercel.app,http://localhost:3000
FRONTEND_URL=https://cripto-curitiba.vercel.app   # alvo da revalidação ISR (sempre produção)
REVALIDATE_SECRET=
TURNSTILE_SECRET_KEY=
UPLOADS_DIR=/var/www/criptocuritiba/uploads
PUBLIC_UPLOADS_URL=https://criptocuritiba-api.duckdns.org/uploads
ADMIN_SEED_PASSWORD=       # só no primeiro seed
```

### `apps/web/.env` (Vercel)

```
NEXT_PUBLIC_API_URL=https://criptocuritiba-api.duckdns.org/api/v1
NEXT_PUBLIC_SITE_URL=https://cripto-curitiba.vercel.app
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
REVALIDATE_SECRET=
ADMIN_COOKIE_NAME=cc_admin   # cookie host-only gravado pelo BFF (ADR-0006)
```

`CORS_ORIGINS` precisa cobrir também os preview deployments, cuja URL muda a cada
PR (`https://cripto-curitiba-*.vercel.app`) — usar match por regex no plugin de
CORS, nunca `origin: true`. Nenhuma variável do admin é `NEXT_PUBLIC_*`: o token do
painel só existe no lado servidor do Next.

`.env.example` versionado em cada app; `.env` no `.gitignore` desde o primeiro commit.

## Deploy

**Frontend:** push na `main` → build automático na Vercel. Preview por PR.

**Backend:** script [`deploy/deploy.sh`](../deploy/deploy.sh) executado por SSH:

```bash
ssh deploy@<vps> 'cd ~/cripto-curitiba && ./deploy/deploy.sh'
```

O script atualiza o código, instala dependências, aplica migrations, compila e
recarrega o PM2, conferindo `/health` no fim.

CI (GitHub Actions), já no repositório:

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — em PR e na `main`:
  lint, typecheck, testes contra um Postgres de serviço e build do frontend
- [`.github/workflows/deploy-api.yml`](../.github/workflows/deploy-api.yml) — na
  `main`, deploy do backend por SSH e checagem de `/health` depois

Os segredos necessários estão em [deploy/README.md](../deploy/README.md#segredos-do-github-actions).
Sem eles, o deploy continua manual por SSH.

## Backups

- `pg_dump` diário às 03:00 via cron, comprimido, em `/var/backups/postgres`
- Retenção: 7 diários + 4 semanais
- Cópia offsite com `rclone` para um bucket (R2/B2) — **não** deixar o único backup
  na mesma máquina que o banco
- **Restore testado uma vez antes do lançamento.** Backup não testado não é backup.

Use [`deploy/backup.sh`](../deploy/backup.sh):

```bash
0 3 * * * /home/deploy/cripto-curitiba/deploy/backup.sh >> /var/log/backup-criptocuritiba.log 2>&1
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
| Admin dá 401 logo após o login | cookie não gravado: conferir `Secure`/`httpOnly` no Route Handler e se a chamada saiu da mesma origem da Vercel |
| API inacessível pelo browser | conferir o certificado do hostname DuckDNS e se o registro ainda aponta para o IP atual da VPS |

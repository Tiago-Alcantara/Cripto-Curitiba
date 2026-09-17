# Deploy

Topologia e decisões estão em [docs/06-infra-e-deploy.md](../docs/06-infra-e-deploy.md)
e nos [ADRs](../docs/adr/). Aqui ficam os arquivos prontos para usar.

| Arquivo | Onde vai |
|---|---|
| `deploy.sh` | Roda na VPS a cada deploy (o workflow do GitHub chama via SSH) |
| `ecosystem.config.cjs` | Configuração do PM2 para a API |
| `Caddyfile` | Copiar para `/etc/caddy/Caddyfile` e ajustar o hostname |
| `backup.sh` | Cron diário do `pg_dump` + cópia offsite |

## Frontend (Vercel)

1. Importar o repositório na Vercel.
2. **Root Directory:** `apps/web`.
3. Marcar *Include files outside root directory* (é um monorepo).
4. Install e Build Command: **deixar o padrão**. O script `build` de
   `apps/web` já compila `@cripto/shared` antes do `next build` — sem isso o
   build quebra com `Can't resolve '@cripto/shared'`, porque o pacote é
   publicado a partir de `dist/`.
5. Variáveis de ambiente: as de `apps/web/.env.example`. Se não for preencher
   alguma, **apague** em vez de deixar em branco (string vazia vale como não
   definida, mas o log avisa).

O site fica no domínio `*.vercel.app` ([ADR-0009](../docs/adr/0009-dominio-vercel-app.md)).

## Backend (VPS)

Passo a passo do preparo da máquina (usuário `deploy`, firewall, Node, Postgres,
PM2, Caddy) está em [docs/06-infra-e-deploy.md](../docs/06-infra-e-deploy.md#preparo-da-vps-uma-vez).

Resumo depois da máquina pronta:

```bash
# como usuario deploy
git clone https://github.com/Tiago-Alcantara/Cripto-Curitiba.git ~/cripto-curitiba
cd ~/cripto-curitiba
cp apps/api/.env.example apps/api/.env   # preencher: DATABASE_URL, JWT_SECRET, REVALIDATE_SECRET...
cp packages/db/.env.example packages/db/.env

pnpm install --frozen-lockfile
pnpm --filter @cripto/db exec prisma migrate deploy
ADMIN_SEED_PASSWORD='<senha forte>' pnpm db:seed   # cria o admin; troque a senha depois

./deploy/deploy.sh
```

## Segredos do GitHub Actions

O workflow `deploy-api.yml` precisa de:

| Secret | O que é |
|---|---|
| `SSH_HOST` | IP ou hostname da VPS |
| `SSH_USER` | `deploy` |
| `SSH_KEY` | Chave privada com acesso ao usuário `deploy` |
| `API_HEALTH_URL` | `https://<hostname-da-api>/api/v1/health` |

Enquanto esses segredos não existirem, o deploy do backend é manual:
`ssh deploy@<vps> 'cd ~/cripto-curitiba && ./deploy/deploy.sh'`.

## Checklist antes do lançamento

- [ ] Hostname da API com TLS válido (Caddy) e `/api/v1/health` respondendo
- [ ] Frontend na Vercel apontando para esse hostname
- [ ] `CORS_ORIGINS` cobrindo produção **e** os previews (`https://<projeto>-*.vercel.app`)
- [ ] `JWT_SECRET` e `REVALIDATE_SECRET` com valores próprios (nunca os do `.env.example`)
- [ ] Senha do admin trocada depois do primeiro login
- [ ] Backup diário ativo **e restauração testada uma vez**
- [ ] Monitor de uptime apontando para `/api/v1/health`

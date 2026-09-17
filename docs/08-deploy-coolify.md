# 08 — Deploy no Coolify

Topologia em uso: **API e Postgres no Coolify** (que roda em Docker e cuida de
proxy reverso e TLS), **frontend na Vercel**.

Isto substitui o caminho manual de VPS + PM2 + Caddy descrito em
[06-infra-e-deploy](06-infra-e-deploy.md), que fica como alternativa
([ADR-0010](adr/0010-coolify.md)).

```
Usuário → Vercel (Next.js)
             │ HTTPS
             ▼
        Coolify (Traefik: TLS + proxy)
             │ rede interna do Docker
             ├── container da API (Fastify, porta 3333)
             └── Postgres (sem porta pública)
```

## 1. Domínio da API

A API precisa de um hostname com HTTPS — o site é servido em HTTPS e o browser
bloqueia chamada HTTP ([ADR-0009](adr/0009-dominio-vercel-app.md)).

- Crie um registro **A** apontando para o IP da máquina do Coolify:
  `api.seudominio.com.br` → `<IP>`.
- Sem domínio próprio: um subdomínio **DuckDNS** gratuito serve
  (`criptocuritiba-api.duckdns.org`). O Coolify emite o certificado via
  Let's Encrypt sozinho, pelo desafio HTTP.
- Verifique antes de seguir: `dig +short api.seudominio.com.br` tem que
  devolver o IP da máquina.

## 2. Postgres como recurso do Coolify

`+ New` → `Database` → `PostgreSQL 16`.

- **Não** exponha porta pública ("Public Port" desligado). A API fala com o
  banco pela rede interna do Docker.
- Anote a **Postgres URL (internal)** que o Coolify mostra. É ela que vai em
  `DATABASE_URL`, no formato
  `postgresql://postgres:<senha>@<nome-do-servico>:5432/postgres`.
- Em `Backups`, agende um backup diário (o Coolify faz `pg_dump` e pode enviar
  para um bucket S3). **Faça um restore de teste antes do lançamento** — backup
  não testado não é backup.

## 3. Aplicação da API

`+ New` → `Application` → `Public Repository` (ou GitHub App, para deploy
automático a cada push).

| Campo | Valor |
|---|---|
| Repository | `https://github.com/Tiago-Alcantara/Cripto-Curitiba` |
| Branch | `main` |
| Build Pack | **Dockerfile** |
| Base Directory | `/` |
| Dockerfile Location | `/apps/api/Dockerfile` |
| Ports Exposes | `3333` |
| Domain | `https://api.seudominio.com.br` |
| Health Check Path | `/api/v1/health` |

> O contexto de build é a **raiz** do repositório, não `apps/api`: é um monorepo
> pnpm e a imagem precisa de `packages/`. Por isso Base Directory `/`.

### Storage das fotos

`Storages` → `Add` → volume persistente montado em `/app/uploads`. Sem isso, as
fotos enviadas pelo painel somem a cada deploy.

## 4. Variáveis de ambiente

Em `Environment Variables` da aplicação:

```
DATABASE_URL=postgresql://postgres:<senha>@<servico-do-postgres>:5432/postgres
JWT_SECRET=<32+ caracteres aleatorios>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://criptocuritiba-web-one.vercel.app,https://criptocuritiba-web-*.vercel.app
FRONTEND_URL=https://criptocuritiba-web-one.vercel.app
REVALIDATE_SECRET=<mesmo valor configurado na Vercel>
UPLOADS_DIR=/app/uploads
PUBLIC_UPLOADS_URL=https://api.seudominio.com.br/uploads
LOG_LEVEL=info
TURNSTILE_SECRET_KEY=      # opcional; sem ele, anti-spam = honeypot + rate limit
```

Gere os segredos com `openssl rand -base64 32`.

`NODE_ENV`, `HOST` e `PORT` já vêm da imagem (`production`, `0.0.0.0`, `3333`) —
**não sobrescreva `HOST` com `127.0.0.1`**, ou o proxy do Coolify não alcança o
container.

## 5. Primeiro deploy

`Deploy`. O que acontece:

1. Coolify constrói a imagem (`apps/api/Dockerfile`).
2. O container sobe e o `docker-entrypoint.sh` roda `prisma migrate deploy`
   antes de iniciar a API — o banco é criado/atualizado sozinho.
3. O health check em `/api/v1/health` passa a responder.

Confira de fora: `curl https://api.seudominio.com.br/api/v1/health` →
`{"status":"ok",...}`.

### Criar o usuário admin (uma vez)

No terminal da aplicação (`Terminal` no Coolify, ou `docker exec`):

```bash
ADMIN_SEED_EMAIL='voce@exemplo.com' ADMIN_SEED_PASSWORD='<senha forte>' \
  pnpm --filter @cripto/db exec tsx prisma/seed.ts
```

O seed também cadastra o catálogo de criptomoedas. Os estabelecimentos de
exemplo entram junto — apague os que começam com "Exemplo" pelo painel antes de
divulgar o site.

## 6. Lado da Vercel

Nas variáveis do projeto:

```
NEXT_PUBLIC_API_URL=https://api.seudominio.com.br/api/v1
NEXT_PUBLIC_SITE_URL=https://criptocuritiba-web-one.vercel.app
REVALIDATE_SECRET=<mesmo valor da API>
```

Redeploy depois de salvar — variáveis `NEXT_PUBLIC_*` são embutidas no build.

## 7. Deploy contínuo

Com a GitHub App conectada, ligue `Automatic Deployment`: cada push na `main`
reconstrói a API. O frontend a Vercel já reconstrói sozinha.

Por isso este repositório **não** tem workflow de deploy por SSH — quem
orquestra o deploy é o Coolify. O [CI](../.github/workflows/ci.yml) continua
rodando lint, tipos e testes em cada PR.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Deploy passa, mas o domínio dá 502 | `HOST` sobrescrito para `127.0.0.1`, ou "Ports Exposes" diferente de `3333` |
| `DatabaseNotReachable` no log | `DATABASE_URL` usando `localhost` em vez do nome do serviço Postgres na rede do Docker |
| Site na Vercel mostra "não conseguimos carregar" | `NEXT_PUBLIC_API_URL` errada, ou o domínio da API sem certificado ainda |
| Requisição do browser bloqueada por CORS | Domínio da Vercel fora de `CORS_ORIGINS` (inclua também o padrão de preview) |
| Fotos somem depois do deploy | Falta o volume persistente em `/app/uploads` |
| Rate limit contando errado | Normal atrás de proxy: a API já usa `trustProxy`, e o Traefik envia `X-Forwarded-For` |

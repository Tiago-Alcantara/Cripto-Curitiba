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

## 1. Endereço da API

A API precisa de um endereço alcançável pela Vercel. Duas opções — a primeira
não exige domínio nenhum.

### Opção A — URL gerada pelo Coolify (sem domínio próprio)

No campo `Domains` da aplicação existe um botão que gera um endereço
automaticamente (nas versões atuais, **Generate Domain**). O Coolify monta um
hostname a partir do IP do servidor usando **sslip.io** — um serviço de DNS que
resolve `qualquer-coisa.<IP>.sslip.io` para aquele IP, sem cadastro:

```
https://a1b2c3.203.0.113.10.sslip.io
```

Como o hostname resolve publicamente, o Traefik do Coolify consegue emitir o
certificado Let's Encrypt sozinho. Requisitos: **IP público** na máquina e
**portas 80 e 443 abertas** para a internet.

Guarde a URL gerada — ela entra em `PUBLIC_UPLOADS_URL` aqui e em
`NEXT_PUBLIC_API_URL` na Vercel.

> **Se o endereço gerado ficar só em `http://`** (certificado não emitido): o
> site continua funcionando, porque o browser nunca fala com a API — todas as
> chamadas do navegador vão para a origem da Vercel, que repassa no servidor
> ([ADR-0006](adr/0006-auth-admin.md)). Mas o tráfego entre a Vercel e a API
> passaria **em texto puro pela internet, incluindo a senha do admin no
> login**. Trate como arranjo temporário: resolva o certificado antes de usar o
> painel para valer.

### Opção B — domínio próprio

Registro **A** apontando para o IP da máquina (`api.seudominio.com.br` → IP), e
o endereço vai no campo `Domains`. Confirme antes de seguir:
`dig +short api.seudominio.com.br` tem que devolver o IP.

Um subdomínio **DuckDNS** gratuito também serve, se preferir um nome mais curto
que o do sslip.io.

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
| Dockerfile Location | `/Dockerfile` (é o padrão — não precisa mexer) |
| Ports Exposes | `3333` |
| Domain | a URL do passo 1 (gerada pelo Coolify ou seu domínio) |
| Path (no cadastro do domínio) | **vazio** — ver o aviso abaixo |
| Health Check Path | `/api/v1/health` |

> **Deixe o campo `Path` do domínio vazio.** No Coolify ele não significa "a
> aplicação responde a partir daqui": significa "monte a aplicação nesse
> prefixo e **remova** o prefixo antes de repassar". Preencher `/api/v1` ali
> produz dois sintomas confusos ao mesmo tempo: `/health` devolve
> `no available server` (nenhuma rota casa) e `/api/v1/health` devolve
> `Rota GET /health nao existe` (o prefixo foi removido antes de chegar na
> API). O `/api/v1` é do código, e quem precisa dele é a Vercel, em
> `NEXT_PUBLIC_API_URL`.

> O contexto de build é a **raiz** do repositório: é um monorepo pnpm e a imagem
> precisa de `packages/`. O `Dockerfile` fica na raiz justamente para que a
> configuração padrão funcione. Se o deploy falhar com
> `failed to read dockerfile: open Dockerfile: no such file or directory`, é
> porque Base Directory ou Dockerfile Location apontam para outro lugar.

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
PUBLIC_UPLOADS_URL=https://<endereco-da-api>/uploads
LOG_LEVEL=info
TURNSTILE_SECRET_KEY=      # opcional; sem ele, anti-spam = honeypot + rate limit
```

Gere os segredos com `openssl rand -base64 32`.

`NODE_ENV`, `HOST` e `PORT` já vêm da imagem (`production`, `0.0.0.0`, `3333`) —
**não sobrescreva `HOST` com `127.0.0.1`**, ou o proxy do Coolify não alcança o
container.

## 5. Primeiro deploy

`Deploy`. O que acontece:

1. Coolify constrói a imagem (`Dockerfile` na raiz).
2. O container sobe e o `docker-entrypoint.sh` roda `prisma migrate deploy`
   antes de iniciar a API — o banco é criado/atualizado sozinho.
3. O health check em `/api/v1/health` passa a responder.

Confira de fora: `curl https://<endereco-da-api>/api/v1/health` →
`{"status":"ok",...}`.

### Criar o usuário admin (uma vez)

No terminal da aplicação (`Terminal` no Coolify, ou `docker exec`):

```bash
ADMIN_SEED_EMAIL='voce@exemplo.com' ADMIN_SEED_PASSWORD='<senha forte>' \
  pnpm --filter @cripto/db exec tsx prisma/seed.ts
```

O seed cadastra o catálogo de criptomoedas e o admin. Os estabelecimentos de
exemplo **não** entram: com `NODE_ENV=production` o seed os ignora, para não
publicar lugar fictício como se fosse real.

## 6. Lado da Vercel

Nas variáveis do projeto:

```
NEXT_PUBLIC_API_URL=https://<endereco-da-api>/api/v1
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
| `no available server` no navegador | Mensagem do Traefik, não da API: existe rota mas nenhum container saudável atrás dela — ou o campo `Path` do domínio está preenchido, e a URL que você tentou não casa com ele |
| `{"code":"NOT_FOUND","message":"Rota GET /health nao existe"}` | A API respondeu (bom sinal), mas chegou nela sem o prefixo: `Path` preenchido no cadastro do domínio |
| Deploy passa, mas o domínio dá 502 | `HOST` sobrescrito para `127.0.0.1`, ou "Ports Exposes" diferente de `3333` |
| `DatabaseNotReachable` no log | `DATABASE_URL` usando `localhost` em vez do nome do serviço Postgres na rede do Docker |
| Site na Vercel mostra "não conseguimos carregar" | `NEXT_PUBLIC_API_URL` errada, ou o domínio da API sem certificado ainda |
| Requisição do browser bloqueada por CORS | Domínio da Vercel fora de `CORS_ORIGINS` (inclua também o padrão de preview) |
| Fotos somem depois do deploy | Falta o volume persistente em `/app/uploads` |
| Rate limit contando errado | Normal atrás de proxy: a API já usa `trustProxy`, e o Traefik envia `X-Forwarded-For` |

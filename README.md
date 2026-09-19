# Cripto Curitiba

[![CI](https://github.com/Tiago-Alcantara/Cripto-Curitiba/actions/workflows/ci.yml/badge.svg)](https://github.com/Tiago-Alcantara/Cripto-Curitiba/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-criptocuritiba--web--one.vercel.app-0e5c43)](https://criptocuritiba-web-one.vercel.app)

Diretório web de estabelecimentos que aceitam criptomoedas em Curitiba — com
selo de **verificado** (confirmado pela equipe, com data) vs **reportado pela
comunidade**, mapa, formulário de sugestão e painel de moderação.

**Site:** https://criptocuritiba-web-one.vercel.app

## Por que existe

Diretórios de estabelecimentos cripto já existem (Coinmap, BTC Map,
AceitaBitcoin, Bitmapa...), mas nenhum é focado em Curitiba: cobertura rasa,
dado desatualizado e nenhum deles diz o que importa na prática — *qual* cripto
o lugar aceita, *por qual rede/forma* (Lightning? on-chain? em qual rede?) e
*se a informação ainda vale hoje*.

O Cripto Curitiba nasce como esse recorte hiperlocal, com curadoria como
produto: cada forma de pagamento carrega a data da última confirmação, e cada
local tem um selo explícito de confiança. É o primeiro módulo de um hub maior
— a arquitetura já reserva espaço para outros ramos (eventos, comunidades,
P2P) sem que eles precisem existir agora. Contexto completo em
[docs/01-visao-e-escopo.md](docs/01-visao-e-escopo.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Fastify 5 + TypeScript, validação com Zod |
| Banco | PostgreSQL + Prisma 7 (driver adapter `pg`) |
| Mapa | React Leaflet + tiles do OpenStreetMap (sem chave de API) |
| Auth do painel | Cookie `httpOnly` + JWT, BFF nos Route Handlers do Next |
| Monorepo | pnpm workspaces |
| Lint/format | Biome |
| Testes | Vitest (54 testes de integração da API, contra Postgres real) |
| CI | GitHub Actions — lint, typecheck, testes, build |
| Deploy | API + Postgres em container no **Coolify**; frontend na **Vercel** |

## Arquitetura

Monolito modular: um processo Fastify só, organizado por domínio
(`establishments`, `cryptos`, `suggestions`, `auth`, `admin`), em vez de
microsserviços — overkill para o volume atual. Cada módulo segue
`routes → service → repository`; só o `repository` toca o Prisma.

```
Vercel (Next.js, App Router)
  ├─ paginas publicas com ISR (revalidadas sob demanda ao publicar)
  ├─ painel /admin, protegido por proxy.ts
  └─ BFF: Route Handlers repassam para a API como Bearer, o token
     nunca chega ao browser
        │ HTTPS
        ▼
Coolify (Docker + Traefik)
  ├─ container da API (Fastify) ── /api/v1/*
  └─ Postgres (sem porta publica, so rede interna)
```

Decisões e trade-offs relevantes estão registrados como ADRs em
[docs/adr/](docs/adr/) — vale ler antes de propor mudar algo estrutural.

### Estrutura do repositório

```
apps/
  api/                  Fastify — API REST /api/v1
    src/modules/        establishments, cryptos, suggestions, auth, admin
    src/plugins/        prisma, auth (JWT), error-handler
    test/               testes de integração (Vitest + Postgres real)
  web/                  Next.js
    app/(site)/         páginas públicas (home, listagem, detalhe, mapa, sugerir)
    app/admin/          painel (fila de moderação, CRUD de estabelecimentos)
    app/api/            BFF: proxy de sessão do admin e revalidação do ISR
packages/
  db/                   schema.prisma, migrations, seed, cliente Prisma
  shared/               contratos Zod compartilhados entre api e web
  config/               tsconfig base
docs/                   visão, arquitetura, modelo de dados, API, design, deploy
deploy/                 caminho manual alternativo (VPS + PM2 + Caddy)
Dockerfile              imagem da API, usada pelo Coolify
```

## Rodar localmente

Requisitos: Node 22, pnpm 10, PostgreSQL 16.

```bash
pnpm install

createdb criptocuritiba_dev
createdb criptocuritiba_test          # usado pelos testes

cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
# ajuste DATABASE_URL nos dois se usuário/senha do Postgres forem outros

pnpm db:migrate
ADMIN_SEED_PASSWORD=dev pnpm db:seed  # catálogo de criptos + admin + dados de exemplo

pnpm dev                              # api em :3333, site em :3000
```

```bash
pnpm lint        # Biome
pnpm typecheck   # tsc em todos os pacotes
pnpm test        # Vitest (API) — usa o banco criptocuritiba_test
```

Mais detalhes e convenções de código em [CONTRIBUTING.md](CONTRIBUTING.md).

## Deploy

- **API + Postgres:** container Docker no Coolify, a partir do
  [`Dockerfile`](Dockerfile) na raiz (o contexto de build precisa ser a raiz —
  é um monorepo). Migrations rodam sozinhas no boot do container. Passo a
  passo completo em [docs/08-deploy-coolify.md](docs/08-deploy-coolify.md).
- **Frontend:** Vercel, Root Directory `apps/web`, deploy automático a cada
  push na `main`.

Não é preciso domínio próprio: o backend pode usar a URL gratuita que o
Coolify gera via sslip.io, e o frontend fica em `*.vercel.app` — a decisão e
suas implicações (auth via BFF em vez de cookie compartilhado) estão em
[ADR-0009](docs/adr/0009-dominio-vercel-app.md) e
[ADR-0006](docs/adr/0006-auth-admin.md).

Caminho alternativo sem Coolify (VPS + PM2 + Caddy manual) em
[docs/06-infra-e-deploy.md](docs/06-infra-e-deploy.md).

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/01-visao-e-escopo.md](docs/01-visao-e-escopo.md) | Conceito, pesquisa de mercado, público, escopo do MVP, métricas |
| [docs/02-arquitetura.md](docs/02-arquitetura.md) | Monolito modular, monorepo, camadas, topologia de deploy |
| [docs/03-modelo-de-dados.md](docs/03-modelo-de-dados.md) | Entidades e schema Prisma |
| [docs/04-api-v1.md](docs/04-api-v1.md) | Contrato REST `/api/v1`, filtros, formato de erro, rate limit |
| [docs/05-design.md](docs/05-design.md) | Direção visual, tokens, componentes, acessibilidade |
| [docs/06-infra-e-deploy.md](docs/06-infra-e-deploy.md) | Caminho manual (VPS, Caddy, PM2) — alternativa ao Coolify |
| [docs/08-deploy-coolify.md](docs/08-deploy-coolify.md) | Deploy em uso: API e Postgres no Coolify, frontend na Vercel |
| [docs/07-roadmap.md](docs/07-roadmap.md) | Fases do MVP, o que está pronto, pendências conhecidas |
| [docs/adr/](docs/adr/) | Decisões arquiteturais registradas (ADRs) |

## Status

Site no ar, API e banco em produção, painel admin funcional
(login → CRUD de estabelecimentos → publicar → moderação de sugestões →
revalidação automática do site). Detalhe fase a fase em
[docs/07-roadmap.md](docs/07-roadmap.md).

Pendente:

- **Curadoria real** — o banco de produção só tem o catálogo de criptomoedas e
  o admin; nenhum estabelecimento de exemplo é publicado automaticamente
  (o seed ignora os dados fictícios quando `NODE_ENV=production`).
- **Upload de fotos** — modelo e exibição prontos, falta a rota de upload e o
  campo no editor; hoje uma foto só entra por URL direta no banco.
- **Editor de horários** no painel — o campo existe no banco e aparece no
  site público, mas o editor ainda não grava.
- **Testes de frontend** — toda a cobertura de testes está na API.

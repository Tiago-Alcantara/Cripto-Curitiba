# 02 — Arquitetura

## Visão geral

**Monolito modular** em um **monorepo**. Um único processo Fastify organizado por
domínio, um único Postgres, um frontend Next.js na Vercel. Microsserviços seriam
overkill nesta fase ([ADR-0002](adr/0002-monolito-modular.md)).

```
Usuário
  │  HTTPS
  ▼
Vercel ── Next.js  (https://criptocuritiba-web-one.vercel.app)
  │        ├── páginas públicas (SSR + ISR)
  │        └── Route Handlers /api/*  →  BFF do painel admin
  │  HTTPS  (server-to-server)   api.<host-da-vps>
  ▼
VPS ── Caddy (TLS, proxy reverso, rate limit de borda)
        │  127.0.0.1:3333
        ▼
       Fastify (API REST /api/v1) ── PM2
        │  127.0.0.1:5432
        ▼
       PostgreSQL (não exposto publicamente)
```

O Postgres escuta apenas em `localhost`. A única porta aberta na VPS é 443 (e 22
com chave). O frontend nunca fala com o banco.

**O frontend roda em domínio `*.vercel.app`** ([ADR-0009](adr/0009-dominio-vercel-app.md)).
Duas consequências que atravessam a arquitetura inteira:

1. O painel admin não pode usar cookie compartilhado entre front e API — `vercel.app`
   está na Public Suffix List. O admin passa por um **BFF nos Route Handlers do
   Next** ([ADR-0006](adr/0006-auth-admin.md)): o browser só fala com a origem da
   Vercel, e o Next repassa o token para a API.
2. A API ainda precisa de um **hostname próprio com TLS** — a página é servida em
   HTTPS e o browser bloqueia chamada HTTP (mixed content). Não precisa ser um
   domínio pago: um subdomínio DuckDNS gratuito resolve ([ADR-0009](adr/0009-dominio-vercel-app.md)).

## Monorepo

pnpm workspaces. Turborepo é opcional e só entra se o tempo de build incomodar
([ADR-0001](adr/0001-monorepo-pnpm.md)).

```
cripto-curitiba/
├── apps/
│   ├── web/                 # Next.js (Vercel)
│   │   ├── app/
│   │   │   ├── (site)/      # páginas públicas
│   │   │   ├── admin/       # painel, atrás de login
│   │   │   ├── api/
│   │   │   │   ├── admin/   # BFF: fala com a API Fastify, guarda o token (ADR-0006)
│   │   │   │   └── revalidate/  # webhook de revalidação ISR
│   │   │   └── middleware.ts    # protege /admin
│   │   ├── components/
│   │   └── lib/
│   └── api/                 # Fastify (VPS)
│       └── src/
│           ├── server.ts            # bootstrap, plugins, graceful shutdown
│           ├── plugins/             # cors, helmet, rate-limit, auth, prisma
│           ├── modules/
│           │   ├── establishments/  # o módulo do MVP
│           │   │   ├── establishments.routes.ts
│           │   │   ├── establishments.service.ts
│           │   │   ├── establishments.repository.ts
│           │   │   └── establishments.schemas.ts
│           │   ├── suggestions/
│           │   ├── cryptos/
│           │   ├── auth/
│           │   └── _README.md       # como adicionar um módulo novo
│           └── shared/              # erros, logger, utils
├── packages/
│   ├── db/                  # schema.prisma, migrations, seed, client
│   ├── shared/              # tipos + schemas Zod compartilhados web/api
│   └── config/              # tsconfig, biome, presets
├── docs/
└── pnpm-workspace.yaml
```

### Regras de módulo

1. Um módulo **nunca** importa o repository de outro módulo. Se precisar de dado
   de outro domínio, chama o **service** dele.
2. Camadas fixas: `routes` (HTTP, validação Zod) → `service` (regra de negócio) →
   `repository` (único lugar que toca o Prisma).
3. Toda rota registra-se sob o prefixo do módulo: `/api/v1/estabelecimentos`.
4. Módulos futuros (`events/`, `communities/`) são pastas novas + tabelas novas.
   Nada no módulo do MVP precisa mudar para eles existirem.

Essa disciplina é o que permite extrair um módulo para serviço próprio no futuro
sem refatorar o mundo — e é o único motivo pelo qual o monolito é seguro aqui.

## Contrato entre web e api

`packages/shared` exporta os schemas Zod das respostas da API. O backend valida a
saída com eles (serialização Fastify) e o frontend infere os tipos deles. Um campo
renomeado quebra o build do frontend, não a produção.

## Cache e performance

- **ISR** nas páginas de listagem e detalhe (`revalidate: 3600`). O dado muda
  raramente; a VPS quase não recebe tráfego de leitura.
- **Revalidação sob demanda**: ao publicar/editar um estabelecimento, a API chama
  `POST https://criptocuritiba-web-one.vercel.app/api/revalidate` com um secret e as tags
  afetadas (`estabelecimentos`, `estabelecimento:<slug>`). Conteúdo novo aparece
  em segundos, sem baixar o `revalidate`.
- **Filtros client-side** na listagem: o MVP cabe inteiro em memória (dezenas a
  poucas centenas de registros). Uma única chamada traz a lista; filtro e busca
  rodam no cliente. Paginação server-side já existe na API para quando crescer.
- `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` nas rotas
  públicas de leitura.

## Segurança

- `@fastify/helmet`, CORS restrito às origens conhecidas (produção + preview Vercel + localhost)
- `@fastify/rate-limit` global e mais agressivo em `POST /sugestoes` e `POST /admin/auth/login`
- Validação de entrada com Zod em toda rota; nada de `any` vindo do body
- Admin: token Bearer emitido pela API e guardado em cookie `httpOnly` + `Secure` +
  `SameSite=Lax` **host-only na origem da Vercel**, gravado pelo BFF do Next; senha
  com Argon2id; sem cadastro público ([ADR-0006](adr/0006-auth-admin.md))
- CORS **sem credenciais**: nenhuma requisição autenticada sai do browser direto
  para a API, então a API não precisa aceitar cookies de outra origem
- Segredos só em `.env` na VPS e em Environment Variables da Vercel; `.env.example` versionado, `.env` nunca

## Observabilidade

- `pino` com log estruturado; `pino-pretty` só em dev
- `pm2-logrotate` na VPS
- `GET /api/v1/health` (processo) e `GET /api/v1/health/db` (`SELECT 1`)
- Uptime externo: UptimeRobot/Better Stack (free) apontando para `/health`
- Sentry opcional (tier free) nas duas apps — entra na Fase 5, não antes

## Testes

- **Vitest** nos dois apps.
- Backend: teste de service com repository fake (unitário) + teste de rota com
  banco de teste real via `pnpm db:test:reset` (integração). Prioridade: filtros
  de listagem e fluxo de moderação de sugestões.
- Frontend: teste de componente só onde há lógica (filtros, formulário). Sem meta
  de cobertura — teste onde quebrar dói.

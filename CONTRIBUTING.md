# Como rodar o projeto

## Requisitos

- Node 22 (`.nvmrc`)
- pnpm 10 (`corepack enable`)
- PostgreSQL 16 rodando local

## Primeira vez

```bash
pnpm install

# banco local
createdb criptocuritiba_dev
createdb criptocuritiba_test

cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
# ajuste DATABASE_URL nos dois se o usuario/senha do Postgres for outro

pnpm db:migrate                       # aplica as migrations
ADMIN_SEED_PASSWORD=dev pnpm db:seed  # catalogo de criptos + admin + dados de exemplo
```

## Dia a dia

```bash
pnpm dev          # sobe api (3333) e web (3000)
pnpm lint         # biome
pnpm typecheck    # tsc em todos os pacotes
pnpm test         # vitest (usa o banco criptocuritiba_test)
```

## Estrutura

| Pasta | O que é |
|---|---|
| `apps/api` | Fastify. Um módulo por domínio em `src/modules/<dominio>`, camadas `routes → service → repository` |
| `apps/web` | Next.js (App Router) |
| `packages/db` | Schema Prisma, migrations, seed, cliente |
| `packages/shared` | Schemas Zod do contrato da API, compartilhados entre web e api |
| `packages/config` | tsconfig base |

## Convenções

- Código e banco em inglês; URLs, JSON público e UI em português ([ADR-0008](docs/adr/0008-idioma-do-codigo.md)).
- Só o `repository` toca o Prisma. Módulo não importa repository de outro módulo.
- Toda entrada e saída de rota é validada por schema Zod de `@cripto/shared`.
- Migration nova sempre por `pnpm db:migrate` (nunca `db push`).

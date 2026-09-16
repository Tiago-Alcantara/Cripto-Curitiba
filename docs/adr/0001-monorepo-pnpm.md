# ADR-0001 — Monorepo com pnpm workspaces

**Status:** Aceita · 2026-09

## Contexto

Frontend (Next.js) e backend (Fastify) são desenvolvidos pela mesma pessoa, mudam
juntos e compartilham tipos de contrato da API. Deploy é separado (Vercel e VPS).

## Decisão

Um único repositório com pnpm workspaces: `apps/web`, `apps/api`, `packages/db`,
`packages/shared`, `packages/config`. Turborepo não entra agora — só se o tempo de
build passar a incomodar.

## Consequências

- Mudança de contrato da API é um PR só; tipos compartilhados via `packages/shared` impedem divergência silenciosa.
- A Vercel precisa ser configurada com *Root Directory* `apps/web` e install command na raiz.
- O deploy da VPS puxa o repo inteiro (custo desprezível).
- Se um dia web e api tiverem donos diferentes, a separação é possível — o acoplamento está concentrado em `packages/shared`.

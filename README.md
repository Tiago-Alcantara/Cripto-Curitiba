# Cripto Curitiba

Hub web de criptomoedas focado na cidade de Curitiba.

O primeiro módulo é um **diretório de estabelecimentos que aceitam criptomoedas**
(restaurantes, cafés, bares, comércio em geral), mostrando quais criptos cada um
aceita e por qual forma de pagamento (Lightning, on-chain, carteira própria etc.).

O diferencial em relação aos diretórios globais/nacionais (BTC Map, Coinmap,
AceitaBitcoin, Bitmapa) é a **curadoria local**: cada local carrega um selo de
`verificado` (checado presencialmente/por contato direto) ou
`reportado pela comunidade`.

> **Status:** fases 0 a 4 implementadas (monorepo, API, site público, mapa,
> sugestões e painel admin). Falta a fase 5: subir na VPS e na Vercel, e a
> curadoria dos estabelecimentos reais. Ver [docs/07-roadmap.md](docs/07-roadmap.md).

## Rodar localmente

Requisitos, comandos e convenções estão em [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
pnpm install
pnpm db:migrate
ADMIN_SEED_PASSWORD=dev pnpm db:seed
pnpm dev     # api em :3333, site em :3000
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/01-visao-e-escopo.md](docs/01-visao-e-escopo.md) | Conceito, mercado, público, escopo do MVP, métricas |
| [docs/02-arquitetura.md](docs/02-arquitetura.md) | Monolito modular, monorepo, camadas, topologia de deploy |
| [docs/03-modelo-de-dados.md](docs/03-modelo-de-dados.md) | Entidades e rascunho do `schema.prisma` |
| [docs/04-api-v1.md](docs/04-api-v1.md) | Contrato REST `/api/v1`, filtros, erros, rate limit |
| [docs/05-design.md](docs/05-design.md) | Direção visual, tokens, componentes, páginas, acessibilidade |
| [docs/06-infra-e-deploy.md](docs/06-infra-e-deploy.md) | VPS, Caddy, PM2, Postgres, backups, CI/CD, env vars |
| [docs/07-roadmap.md](docs/07-roadmap.md) | Fases do MVP, entregáveis e checklists |
| [docs/adr/](docs/adr/) | Decisões arquiteturais registradas (ADRs) |

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui — deploy na Vercel, no domínio `*.vercel.app`
- **Backend:** Node.js + Fastify + TypeScript — VPS própria, gerenciado por PM2
- **Banco:** PostgreSQL + Prisma — na mesma VPS, sem exposição pública
- **Proxy/TLS:** Caddy
- **Repo:** monorepo com pnpm workspaces

## Decisões ainda em aberto

Estão listadas em [docs/07-roadmap.md](docs/07-roadmap.md#fase-0--decisões-e-fundação)
e têm recomendação registrada nos ADRs correspondentes. As três que travam o
início do código: identidade visual, biblioteca de mapa e idioma do código.

O frontend fica no domínio gratuito da Vercel — decisão com efeito direto na
autenticação do admin e no hostname da API, detalhado em
[ADR-0009](docs/adr/0009-dominio-vercel-app.md) e [ADR-0006](docs/adr/0006-auth-admin.md).

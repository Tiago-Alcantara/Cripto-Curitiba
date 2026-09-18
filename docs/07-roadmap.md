# 07 — Roadmap

Fases sequenciais até o lançamento do MVP. As estimativas assumem um
desenvolvedor trabalhando em tempo parcial; o que importa é a ordem e os
critérios de pronto, não as datas.

---

## Fase 0 — Decisões e fundação  *(~1 semana)*

Nada de produto ainda; é o que destrava todo o resto.

**Decisões a fechar:**

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Identidade visual (cores, tipografia, logo) | Paleta proposta em [05-design](05-design.md); precisa de aval |
| 2 | Biblioteca de mapa | React Leaflet + tiles do OpenStreetMap ([ADR-0005](adr/0005-mapa.md)) |
| 3 | Idioma do código | Código/DB em inglês, URLs/UI em português ([ADR-0008](adr/0008-idioma-do-codigo.md)) |
| 4 | Auth do admin | BFF no Next + token Bearer + Argon2 ([ADR-0006](adr/0006-auth-admin.md)) |
| 5 | Hostname da API | Subdomínio DuckDNS gratuito, já que o site fica em `*.vercel.app` ([ADR-0009](adr/0009-dominio-vercel-app.md)) |

**Entregáveis:**

- [x] Monorepo pnpm com `apps/web`, `apps/api`, `packages/db`, `packages/shared`, `packages/config`
- [x] TypeScript strict + Biome (lint/format) + Vitest configurados
- [x] `apps/api`: Fastify com `/api/v1/health`, plugins base, tratamento de erro padronizado
- [x] `apps/web`: Next.js App Router + Tailwind + shadcn/ui, tokens da paleta aplicados
- [x] Postgres local rodando, Prisma conectado, primeira migration vazia aplicada
- [x] `.env.example` nos dois apps, `.gitignore`, `CLAUDE.md`/`CONTRIBUTING.md` curtos
- [x] CI de PR (lint + typecheck + test + build)

**Pronto quando:** `pnpm dev` sobe web e api juntos e a home consome `/health` da API local.

---

## Fase 1 — Backend do módulo de estabelecimentos  *(~1 semana)*

- [x] `schema.prisma` completo do módulo ([03-modelo-de-dados](03-modelo-de-dados.md)) + migration
- [x] Seed de `Crypto` e do admin OWNER
- [x] Módulo `establishments`: routes → service → repository
- [x] `GET /estabelecimentos` com todos os filtros, paginação e ordenação
- [x] `GET /estabelecimentos/:slug`
- [x] `GET /criptomoedas`, `GET /bairros`
- [x] Schemas Zod compartilhados em `packages/shared`
- [x] Testes de integração dos filtros (o ponto mais propenso a erro da API)
- [ ] 10+ estabelecimentos reais no arquivo de seed (o seed tem dados de exemplo; a curadoria real é trabalho de campo)

**Pronto quando:** dá para navegar a API inteira com `curl` e os filtros combinados retornam o esperado.

---

## Fase 2 — Frontend público  *(~1,5 semana)*

- [x] Layout base (header, footer, tipografia, tokens)
- [x] Home com busca, contador e destaques
- [x] `/estabelecimentos` com `FilterBar` (estado na URL) e grid de cards
- [x] `/estabelecimentos/[slug]` com ISR e `generateStaticParams`
- [x] `EstablishmentCard`, `CryptoChip`, `VerificationBadge`, `EmptyState`
- [x] Estados de loading, erro e vazio em todas as telas
- [x] SEO: metadata por página, `sitemap.xml`, `robots.txt`, JSON-LD `Restaurant`/`LocalBusiness`, OG images
- [x] Responsivo conferido em 360px

**Pronto quando:** o site é usável de ponta a ponta com dados de seed, sem mapa.

---

## Fase 3 — Mapa e sugestões da comunidade  *(~1 semana)*

- [x] `MapView` com clustering, carregado dinamicamente (`ssr: false`)
- [x] Alternância lista/mapa na listagem, sincronizada com os filtros
- [x] Página `/mapa` dedicada, com lista lateral sincronizada com os pins
- [x] Mapa pequeno na página de detalhe + link "como chegar"
- [x] `POST /sugestoes` com rate limit, honeypot e Turnstile
- [x] `/sugerir` com os três tipos de sugestão
- [x] Botão "reportar erro" na página de detalhe, pré-preenchendo o formulário

**Pronto quando:** uma sugestão enviada pelo site cai no banco com status pendente.

---

## Fase 4 — Painel admin  *(~1 semana)*

- [x] `POST /admin/auth/login|logout|me` na API, com token Bearer, `preHandler` de auth e rate limit
- [x] BFF no Next: Route Handlers `app/api/admin/*` que guardam o token em cookie host-only e repassam como Bearer ([ADR-0006](adr/0006-auth-admin.md))
- [x] `/admin` protegido por `middleware.ts` (redireciona para o login sem cookie válido)
- [x] Lista + editor de estabelecimentos (pagamentos aceitos incluídos; **upload de fotos ainda não**)
- [x] Ações de publicar / arquivar / marcar como verificado (com nota e data)
- [x] Fila de moderação de sugestões: aprovar (vira registro) / rejeitar / marcar spam
- [x] `AuditLog` gravando as ações do admin
- [x] Revalidação ISR disparada nas publicações

**Pronto quando:** dá para cadastrar e publicar um estabelecimento sem tocar em SQL.

---

## Fase 5 — Produção e lançamento  *(~1 semana)*

Os arquivos já estão no repositório (`deploy/` e `.github/workflows/`); o que
falta depende da sua VPS e das suas contas.

- [x] Scripts e configs prontos: `deploy/deploy.sh`, `deploy/ecosystem.config.cjs`, `deploy/Caddyfile`, `deploy/backup.sh`
- [x] CI de PR (lint + typecheck + testes com Postgres + build)
- [x] Workflow de deploy do backend por SSH, com checagem de `/health`
- [ ] VPS preparada conforme [06-infra-e-deploy](06-infra-e-deploy.md)
- [ ] Subdomínio DuckDNS apontando para a VPS (+ cron de atualização) e TLS via Caddy
- [ ] Rodar o primeiro deploy e o seed do admin na VPS
- [ ] Frontend na Vercel no domínio `*.vercel.app`, com `CORS_ORIGINS` cobrindo produção e previews
- [ ] Segredos do GitHub Actions (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `API_HEALTH_URL`)
- [ ] Backup diário configurado **e restore testado**
- [ ] Monitor de uptime em `/health`
- [ ] Analytics respeitando privacidade (Plausible/Umami ou Vercel Analytics)
- [ ] Páginas `/sobre` e `/privacidade`
- [ ] Curadoria final: 20–30 locais, ≥10 verificados
- [ ] Google Search Console + sitemap submetido
- [ ] Divulgação: comunidades cripto locais, Instagram, contato com os estabelecimentos cadastrados (eles divulgam por interesse próprio)

**Pronto quando:** o site está no ar, indexável, com dado real e rota de atualização funcionando.

---

## Pendências conhecidas do que já foi construído

- **Upload de fotos**: o modelo (`EstablishmentPhoto`) e a exibição existem, mas
  ainda não há rota de upload nem campo no editor. Hoje uma foto só entra por
  URL direto no banco.
- **Horários no editor**: o campo existe no banco e aparece na página pública;
  o editor do painel ainda não edita.
- **Turnstile**: a verificação está implementada, mas só liga quando as chaves
  forem configuradas. Sem elas, o anti-spam é honeypot + rate limit.
- **Testes de frontend**: não há. A cobertura está toda na API (40 testes).

## Pós-MVP (não construir agora)

Por ordem provável de valor:

1. **Recheck automático** — alerta no admin para locais sem confirmação há 6+ meses
2. **Página de bairro** (`/bairros/[bairro]`) — bom para SEO local
3. **Área do lojista** — o dono atualiza o próprio cadastro (com moderação)
4. **Módulo de eventos** — primeiro teste real da arquitetura modular
5. **Módulo de comunidades** — grupos, meetups, perfis
6. **Domínio próprio** — quando fizer sentido investir em SEO de marca; a migração
   já está preparada (ADR-0009: paths estáveis, auth independente de domínio)
7. Newsletter, modo escuro, PWA, outras cidades

A regra: **nenhum módulo novo antes do diretório estar vivo, com dado atualizado e
tráfego real.** A arquitetura está pronta para eles; o produto ainda não precisa.

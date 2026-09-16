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
| 2 | Biblioteca de mapa | React Leaflet + CARTO Positron ([ADR-0005](adr/0005-mapa.md)) |
| 3 | Idioma do código | Código/DB em inglês, URLs/UI em português ([ADR-0008](adr/0008-idioma-do-codigo.md)) |
| 4 | Auth do admin | Sessão por cookie + Argon2, sem provider externo ([ADR-0006](adr/0006-auth-admin.md)) |
| 5 | Domínio | Registrar `criptocuritiba.com.br` (verificar disponibilidade) |

**Entregáveis:**

- [ ] Monorepo pnpm com `apps/web`, `apps/api`, `packages/db`, `packages/shared`, `packages/config`
- [ ] TypeScript strict + Biome (lint/format) + Vitest configurados
- [ ] `apps/api`: Fastify com `/api/v1/health`, plugins base, tratamento de erro padronizado
- [ ] `apps/web`: Next.js App Router + Tailwind + shadcn/ui, tokens da paleta aplicados
- [ ] Postgres local rodando, Prisma conectado, primeira migration vazia aplicada
- [ ] `.env.example` nos dois apps, `.gitignore`, `CLAUDE.md`/`CONTRIBUTING.md` curtos
- [ ] CI de PR (lint + typecheck + test + build)

**Pronto quando:** `pnpm dev` sobe web e api juntos e a home consome `/health` da API local.

---

## Fase 1 — Backend do módulo de estabelecimentos  *(~1 semana)*

- [ ] `schema.prisma` completo do módulo ([03-modelo-de-dados](03-modelo-de-dados.md)) + migration
- [ ] Seed de `Crypto` e do admin OWNER
- [ ] Módulo `establishments`: routes → service → repository
- [ ] `GET /estabelecimentos` com todos os filtros, paginação e ordenação
- [ ] `GET /estabelecimentos/:slug`
- [ ] `GET /criptomoedas`, `GET /bairros`
- [ ] Schemas Zod compartilhados em `packages/shared`
- [ ] Testes de integração dos filtros (o ponto mais propenso a erro da API)
- [ ] 10+ estabelecimentos reais no arquivo de seed

**Pronto quando:** dá para navegar a API inteira com `curl` e os filtros combinados retornam o esperado.

---

## Fase 2 — Frontend público  *(~1,5 semana)*

- [ ] Layout base (header, footer, tipografia, tokens)
- [ ] Home com busca, contador e destaques
- [ ] `/estabelecimentos` com `FilterBar` (estado na URL) e grid de cards
- [ ] `/estabelecimentos/[slug]` com ISR e `generateStaticParams`
- [ ] `EstablishmentCard`, `CryptoChip`, `VerificationBadge`, `EmptyState`
- [ ] Estados de loading, erro e vazio em todas as telas
- [ ] SEO: metadata por página, `sitemap.xml`, `robots.txt`, JSON-LD `Restaurant`/`LocalBusiness`, OG images
- [ ] Responsivo conferido em 360px

**Pronto quando:** o site é usável de ponta a ponta com dados de seed, sem mapa.

---

## Fase 3 — Mapa e sugestões da comunidade  *(~1 semana)*

- [ ] `MapView` com clustering, carregado dinamicamente (`ssr: false`)
- [ ] Alternância lista/mapa na listagem, sincronizada com os filtros
- [ ] Mapa pequeno na página de detalhe + link "como chegar"
- [ ] `POST /sugestoes` com rate limit, honeypot e Turnstile
- [ ] `/sugerir` com os três tipos de sugestão
- [ ] Botão "reportar erro" na página de detalhe, pré-preenchendo o formulário

**Pronto quando:** uma sugestão enviada pelo site cai no banco com status pendente.

---

## Fase 4 — Painel admin  *(~1 semana)*

- [ ] `POST /admin/auth/login|logout|me` + middleware de sessão + rate limit
- [ ] `/admin` protegido, com login
- [ ] Lista + editor de estabelecimentos (incl. pagamentos aceitos e upload de fotos)
- [ ] Ações de publicar / arquivar / marcar como verificado (com nota e data)
- [ ] Fila de moderação de sugestões: aprovar (vira registro) / rejeitar / marcar spam
- [ ] `AuditLog` gravando as ações do admin
- [ ] Revalidação ISR disparada nas publicações

**Pronto quando:** dá para cadastrar e publicar um estabelecimento sem tocar em SQL.

---

## Fase 5 — Produção e lançamento  *(~1 semana)*

- [ ] VPS preparada conforme [06-infra-e-deploy](06-infra-e-deploy.md)
- [ ] Domínio + DNS + TLS via Caddy
- [ ] Deploy do backend com PM2 + `migrate deploy` + smoke test
- [ ] Frontend na Vercel com domínio próprio
- [ ] Backup diário configurado **e restore testado**
- [ ] Monitor de uptime em `/health`
- [ ] Analytics respeitando privacidade (Plausible/Umami ou Vercel Analytics)
- [ ] Páginas `/sobre` e `/privacidade`
- [ ] Curadoria final: 20–30 locais, ≥10 verificados
- [ ] Google Search Console + sitemap submetido
- [ ] Divulgação: comunidades cripto locais, Instagram, contato com os estabelecimentos cadastrados (eles divulgam por interesse próprio)

**Pronto quando:** o site está no ar, indexável, com dado real e rota de atualização funcionando.

---

## Pós-MVP (não construir agora)

Por ordem provável de valor:

1. **Recheck automático** — alerta no admin para locais sem confirmação há 6+ meses
2. **Página de bairro** (`/bairros/[bairro]`) — bom para SEO local
3. **Área do lojista** — o dono atualiza o próprio cadastro (com moderação)
4. **Módulo de eventos** — primeiro teste real da arquitetura modular
5. **Módulo de comunidades** — grupos, meetups, perfis
6. Newsletter, modo escuro, PWA, outras cidades

A regra: **nenhum módulo novo antes do diretório estar vivo, com dado atualizado e
tráfego real.** A arquitetura está pronta para eles; o produto ainda não precisa.

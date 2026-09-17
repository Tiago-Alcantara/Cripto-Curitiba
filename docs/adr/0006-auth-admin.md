# ADR-0006 — Autenticação do painel admin: BFF no Next + token Bearer

**Status:** **Proposta** (decisão da Fase 0) · revisada em 2026-09 após a decisão de
hospedar o frontend em `*.vercel.app` ([ADR-0009](0009-dominio-vercel-app.md))

## Contexto

O painel terá 1 a 3 usuários, criados manualmente. Não há cadastro público nem
login de usuário final no MVP. O backend é Fastify (a auth não pode viver só no
Next), e o frontend fica em `https://criptocuritiba-web-one.vercel.app`, enquanto a API
fica em outro host (a VPS).

O ponto que decide o desenho: **`vercel.app` está na Public Suffix List**. Não
existe domínio registrável comum entre front e API, então:

- não dá para setar um cookie com `Domain=` que sirva aos dois;
- um cookie emitido pela API e enviado pelo browser seria **third-party**,
  exigindo `SameSite=None`. Safari (ITP) e Firefox (Total Cookie Protection)
  bloqueiam isso por padrão, e o Chrome caminha na mesma direção.

Cookie cross-site está fora. A alternativa não é "cookie vs token" — é **quem fala
com a API**.

## Decisão proposta

O browser **nunca** chama a API nas rotas de admin. Padrão **BFF** (Backend for
Frontend) nos Route Handlers do Next:

1. `/admin/login` envia credenciais para `POST /api/admin/session` — Route Handler
   na **mesma origem** da Vercel.
2. O Route Handler chama `POST /api/v1/admin/auth/login` na API (server-to-server)
   e recebe `{ token, expiresAt }` — JWT assinado, validade de 7 dias.
3. O Next grava o token em cookie **host-only** (sem atributo `Domain`),
   `httpOnly` + `Secure` + `SameSite=Lax`. É cookie first-party: nenhuma proteção
   de browser interfere.
4. Toda ação do painel passa por Route Handler ou Server Action do Next, que lê o
   cookie e repassa `Authorization: Bearer <token>` para a API.
5. A API valida o Bearer e **não emite nem lê cookies**.

Senha com **Argon2id** (`@node-rs/argon2`). Rate limit de 5 tentativas/15min por IP,
na API e no Route Handler. Usuários criados por script de seed/CLI — **sem rota
pública de cadastro**. Rotas `/admin/*` protegidas por `preHandler` que valida
token e papel.

## Consequências

- Funciona igual em `*.vercel.app`, em preview deployments e em domínio próprio no
  futuro: **trocar de domínio não mexe na autenticação.**
- Nenhum cookie de terceiros; imune a ITP/bloqueio de third-party cookie.
- CORS com credenciais deixa de ser necessário — a API pode recusar credenciais.
- O token nunca fica acessível a JavaScript no browser (não vai para `localStorage`).
- Um hop a mais por operação de admin (Vercel → VPS). Irrelevante neste volume.
- Cada preview deployment tem cookie próprio (host-only), então exige login
  separado. Comportamento esperado, não bug.
- Sem revogação central antes do fim da validade; aceitável para 1–3 usuários
  (trocar `JWT_SECRET` invalida todas as sessões de uma vez).
- Os Route Handlers de admin são dinâmicos e nunca cacheados — correto por
  definição, mas vale lembrar que é a única parte do site fora do ISR.

## Alternativas descartadas

- **Cookie `SameSite=None` emitido pela API:** quebra em Safari e Firefox hoje, não
  em algum futuro. Descartada.
- **Token em `localStorage` + `fetch` direto do browser:** dispensa o BFF, mas
  expõe o token a qualquer XSS. Pior segurança por uma economia de um hop.
- **Auth.js/NextAuth:** resolveria o login no Next, mas a API continuaria
  precisando validar a sessão; acopla auth a um framework de frontend sem ganho.
- **Clerk/Auth0:** custo e dependência externa desproporcionais para três usuários.
- **Basic auth no Caddy:** sem identidade de autor para o `AuditLog` nem papéis.

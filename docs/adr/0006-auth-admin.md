# ADR-0006 — Autenticação do painel admin

**Status:** **Proposta** (decisão da Fase 0) · 2026-09

## Contexto

O painel terá 1 a 3 usuários, todos criados manualmente. Não há cadastro público,
nem login de usuário final no MVP. O backend é Fastify (a auth não pode viver só
no Next) e o frontend está na Vercel, em outro domínio.

## Decisão proposta

Autenticação própria no Fastify:

- Senha com **Argon2id** (`@node-rs/argon2`)
- Sessão em **JWT assinado dentro de cookie** `httpOnly` + `Secure` + `SameSite=Lax`,
  `Domain=.criptocuritiba.com.br`, validade de 7 dias
- `@fastify/cookie` + `@fastify/jwt`; rate limit de 5 tentativas/15min por IP
- Usuários criados por script de seed/CLI — **sem rota pública de cadastro**
- Rotas `/admin/*` protegidas por `preHandler` que valida a sessão e o papel

## Consequências

- Frontend e API precisam estar no mesmo domínio registrável — por isso o site
  **não** pode ficar em `*.vercel.app` em produção.
- Sem revogação central antes do fim da validade do token; aceitável para 1–3
  usuários (mitigação: trocar `SESSION_SECRET` invalida todas as sessões).
- Zero dependência de serviço externo e zero custo.

## Alternativas descartadas

- **Auth.js/NextAuth:** resolve o login no Next, mas o backend continua precisando
  validar a sessão; acopla auth a um framework de frontend sem necessidade.
- **Clerk/Auth0:** excelente DX, custo e dependência externa desproporcionais para três usuários.
- **Basic auth no Caddy:** simples demais — sem identidade de autor para o `AuditLog` nem papéis.

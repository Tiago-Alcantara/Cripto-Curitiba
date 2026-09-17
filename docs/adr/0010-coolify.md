# ADR-0010 — Deploy da API no Coolify (Docker)

**Status:** Aceita · 2026-09 · substitui a decisão de [ADR-0003](0003-sem-docker.md)

## Contexto

O [ADR-0003](0003-sem-docker.md) descartou Docker porque a VPS rodava só este
projeto e PM2 resolvia. A infraestrutura mudou: a máquina agora roda **Coolify**,
uma PaaS auto-hospedada que orquestra tudo em Docker e já entrega proxy reverso
(Traefik), TLS automático, rotina de backup do Postgres e deploy a cada push.

Manter PM2 + Caddy ao lado do Coolify significaria duas formas de operar a mesma
máquina, dois lugares para procurar log e um proxy competindo com o outro pelas
portas 80/443.

## Decisão

A API é publicada como **aplicação Docker no Coolify**, a partir de
[`apps/api/Dockerfile`](../../apps/api/Dockerfile), com o contexto de build na
raiz do repositório (é um monorepo). O Postgres é um **recurso do Coolify**, sem
porta pública. O frontend continua na Vercel.

As migrations rodam no boot do container
([`docker-entrypoint.sh`](../../apps/api/docker-entrypoint.sh)), antes do
servidor subir.

## Consequências

- Proxy, TLS, health check, restart e backup passam a ser configuração no
  Coolify, não script na máquina. Menos coisa nossa para manter.
- Dev e produção ficam mais parecidos: mesma imagem, mesmas versões.
- O build fica mais lento que um `pm2 reload` — aceitável na frequência deste projeto.
- A imagem carrega as dependências de desenvolvimento porque o CLI do Prisma é
  usado no boot para as migrations. Dá para enxugar com `pnpm deploy` num
  estágio extra quando o tamanho incomodar.
- Migration no boot pressupõe **uma instância**. Com mais de uma, mover para o
  "Pre-deployment Command" do Coolify, que roda uma vez por deploy.
- O workflow de deploy por SSH foi removido: quem orquestra o deploy é o
  Coolify, via webhook do GitHub. O CI de lint/tipos/testes continua.

## Alternativas

- **Manter PM2 + Caddy** ao lado do Coolify: dois proxies disputando as portas e
  duas operações paralelas na mesma máquina.
- **Nixpacks** (build pack padrão do Coolify) em vez de Dockerfile: adivinha o
  build sozinho, mas tropeça em monorepo pnpm com pacotes compartilhados
  compilados. Dockerfile explícito é mais previsível.

O caminho manual segue documentado em
[06-infra-e-deploy](../06-infra-e-deploy.md) para quem quiser subir sem Coolify.

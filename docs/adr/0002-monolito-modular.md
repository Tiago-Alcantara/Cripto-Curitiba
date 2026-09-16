# ADR-0002 — Monolito modular no backend

**Status:** Aceita · 2026-09

## Contexto

O projeto começa com um módulo (diretório de estabelecimentos) mas planeja outros
ramos (eventos, comunidades, P2P). Tráfego esperado é baixo; a equipe é uma pessoa;
a infra é uma VPS.

## Decisão

Um único processo Fastify, organizado por domínio em `src/modules/<dominio>/`, com
camadas `routes → service → repository`. Um único Postgres, tabelas agrupadas por
módulo. Microsserviços estão descartados nesta fase.

Regras que mantêm a modularidade viva:

1. Módulo não importa repository de outro módulo — só o service.
2. Só o repository toca o Prisma.
3. Cada módulo registra suas rotas sob o próprio prefixo.

## Consequências

- Deploy, debug e transação ficam simples (uma app, um banco).
- As regras acima são o que permite extrair um módulo depois; se forem violadas, a decisão vira dívida.
- Escala vertical até um volume muito acima do esperado para o MVP.

## Alternativas descartadas

- **Microsserviços:** custo operacional (rede, deploy, observabilidade) sem nenhum ganho nesta escala.
- **Monolito sem módulos:** barato hoje, caro no segundo ramo.

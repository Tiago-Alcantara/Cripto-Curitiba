# ADR-0004 — REST versionado, sem GraphQL

**Status:** Aceita · 2026-09

## Contexto

Um consumidor (o próprio frontend), telas com necessidade de dados previsível,
nenhum cliente externo ainda.

## Decisão

REST com versão no path (`/api/v1/...`), JSON, validação de entrada e saída com
Zod. GraphQL fica fora desta fase.

## Consequências

- Cache HTTP e CDN funcionam sem esforço (importante com ISR).
- Duas formas de resposta a manter (resumida na lista, completa no detalhe) — aceitável.
- `v2` só é criada em quebra de contrato; adições compatíveis ficam em `v1`.

## Quando revisitar

Quando houver cliente externo ou quando um módulo novo exigir consultas
combinadas entre domínios que virem N+1 chamadas na UI.

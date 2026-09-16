# ADR-0008 — Inglês no código, português nas URLs e na UI

**Status:** **Proposta** (decisão da Fase 0) · 2026-09

## Contexto

O domínio do produto é local e falado em português (estabelecimento, bairro,
sugestão), mas frameworks, libs e convenções são em inglês. Misturar sem regra
produz `EstabelecimentoRepository.findAllEstabelecimentos()`.

## Decisão proposta

| Camada | Idioma |
|---|---|
| Modelos Prisma, colunas, código, pastas de módulo | Inglês (`Establishment`, `neighborhood`, `modules/establishments/`) |
| URLs públicas e slugs | Português (`/estabelecimentos/tartuferia-san-paulo`) |
| Chaves do JSON público da API | Português (`nome`, `bairro`, `pagamentos`) |
| Textos de UI, conteúdo, docs, commits | Português |

A tradução acontece em um único lugar: o *presenter* do módulo, que converte a
entidade em resposta pública.

## Consequências

- Uma camada de mapeamento a mais por módulo — o custo real desta decisão.
- Sem plurais irregulares e acentos em identificadores; alinhado com a
  documentação de todas as libs usadas.
- URLs em português ajudam o SEO local, que é o canal principal do projeto.

## Alternativa

Português em tudo, inclusive schema (`Estabelecimento`, `bairro`). Elimina a camada
de tradução e combina com o rascunho original (`modules/restaurantes/`). É uma
escolha legítima — **se preferida, o custo de mudar é zero agora e alto depois da
Fase 1.** Decidir antes da primeira migration.

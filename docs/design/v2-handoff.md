# Handoff: CriptoCuritiba v2 (site público)

Repo de destino: **Tiago-Alcantara/Cripto-Curitiba** (branch `main`).

## Visão geral
Site público do CriptoCuritiba — registro comunitário dos estabelecimentos de Curitiba que aceitam cripto. Cinco telas numa única SPA: **Início, Mapa, Indicar, Sobre, Caderno (blog)**. A identidade é derivada de marcos reais da cidade (calçada portuguesa do Largo da Ordem, Paço da Liberdade, Estufa do Jardim Botânico, estação-tubo) e não reaproveita nenhuma UI existente do repo.

## Sobre os arquivos deste pacote
`CriptoCuritiba v2.dc.html` é **referência de design feita em HTML** — um protótipo que mostra aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar essas telas no ambiente do repositório** (React/Next, Vue, o que já estiver estabelecido), usando os padrões, o roteador e as bibliotecas que já existem lá. Se ainda não houver front-end definido, escolha o framework e implemente as telas nele.

Como abrir o protótipo: abra o `.html` direto no navegador (o `support.js` e o `icon.svg` ao lado são necessários). A estrutura do arquivo é um template declarativo + uma classe de lógica no fim — leia os dois para extrair markup e comportamento; o template usa `sc-for`/`sc-if`, que equivalem a `.map()` e renderização condicional.

`CONTEXT.md` documenta as decisões visuais, incluindo o que já foi testado e **descartado** (leia antes de mexer nos gráficos).

## Fidelidade
**Hi-fi.** Cores, tipografia, espaçamentos e estados finais. Recrie fielmente. Todos os estilos estão inline no template — cada valor abaixo é o valor real usado.

## Design tokens

Cores
| Token | Hex | Uso |
|---|---|---|
| Papel | `#efe9dd` | fundo do site |
| Papel claro | `#fbf8f1` | linha selecionada na tabela |
| Papel quente | `#e7dfcd` | faixa "Como a curadoria funciona" |
| Tinta | `#1b1a16` | texto principal |
| Tinta média | `#4a453b` | parágrafos |
| Tinta fraca | `#6a6254` | rótulos monoespaçados |
| Verde-pinheiro | `#16261f` | fundo do painel de vãos e do rodapé |
| Vidro escuro | `#20382f` / `#244136` | vidro das vidraças (alternado) |
| Verde | `#0f6b4f` | ação primária, links, ilustração da estufa |
| Verde escuro | `#0a4a36` | hover de link |
| Ocre | `#c9902c` | acento, selo, pedra-chave, seleção de texto |
| Ocre escuro | `#8a5f14` | rótulos sobre papel |
| Terracota | `#8c2f1b` | motivos dos vãos, pilares do herói |
| Borda | `#c9bfa8` | divisórias sobre papel |

Tipografia — `Bodoni Moda` (títulos, weight 500), `Archivo` (texto/UI; 700 em botões e rótulos), `JetBrains Mono` (metadados, `letter-spacing` 0.1–0.2em, sempre uppercase).
Escala: h1 `clamp(30px,4.4vw,44px)` · h2 `clamp(26px,3.4vw,40px)` · h3 20–23px · corpo 14–14.5px/1.6 · meta 9.5–11px.

Outros: raio **2px** (quase tudo), 3px em avatares/ícones; réguas de **3px** e **11px** (o 11px é o módulo da calçada); bordas 1px `#c9bfa8` ou 3px `#0f6b4f`; **sem sombras** em nenhum lugar; largura de conteúdo `max-width:1140px` com `padding:0 28px`; animação de entrada `fadeInUp 0.5s ease` por tela.

## Telas

### 1. Início
- **Herói**: título em Bodoni + subtítulo mono, três contadores (total de locais, verificados, bairros) e gráfico chapado do Portal do Passeio Público (pilares terracota) com legenda `PORTAL DO PASSEIO PÚBLICO · 1886`.
- **Destaques**: três fichas dos estabelecimentos verificados (nome, categoria/bairro, selo com data, cripto aceitas).
- **Painel "os quatro vãos"** (fundo `#16261f`): grade `repeat(auto-fit,minmax(176px,1fr))` com `gap:3px`. Cada vão tem 196px de altura, `border-radius:86px 86px 2px 2px`, caixilho `2px solid #efe9dd`, vidro verde com montantes em `repeating-linear-gradient`, e **três registros que não se sobrepõem**: pedra-chave ocre em losango (y14–30) → motivo SVG de 64px (y40–104) → pastilha de cal 58px com numeral romano (y124–182). Sob cada vão, placa `#efe9dd` com título e texto. Motivos (SVG `0 0 96 96`, **só `fill`**, sem traço): I araucária, II relógio do Paço, III estação-tubo, IV farol do saber.
- **Faixa de calçada portuguesa** encerrando o painel (padrão xadrez de 11px, condicionada ao flag `mostrarCalcada`).

### 2. Mapa
- Busca por nome/bairro, chips de categoria e de cripto, toggle "só verificados", contador de resultados.
- Mapa esquemático: os pontos são posicionados por `x`/`y` em **percentual** (dado do mock, não geo real) — na implementação, troque por coordenadas reais e a lib de mapa já adotada no repo (ver `docs/adr/0005-mapa.md`). Pin: 13px normal, 21px selecionado; cal se verificado, ocre se comunidade.
- Tabela/lista de fichas com borda esquerda colorida (`#0f6b4f` selecionada, `#c9bfa8` verificada, `#c9902c` comunidade), número de registro (`001`…, flag `numerarFichas`) e painel de detalhe do selecionado.
- Estado vazio quando os filtros não retornam nada.

### 3. Indicar (formulário)
Campos: nome*, categoria* (select), bairro*, contato, chips de cripto (multi: Bitcoin, Ethereum, Stablecoins, Lightning, Outras), observação, seu nome. Botão só habilita com nome + categoria + bairro preenchidos (`canSubmit`); ao enviar, troca por estado de sucesso com opção de enviar outro. **No app real isso vira `POST` de `Suggestion`** (ver `docs/03-modelo-de-dados.md`) — o protótipo só guarda em estado local.

### 4. Sobre
Explica o produto e a política de selos, com a régua "Como a curadoria funciona" em três colunas (№ 01 a comunidade indica · № 02 a equipe confirma · № 03 o selo é publicado) e, no fim, a **elevação em traço fino da Estufa do Jardim Botânico** (SVG `0 0 600 262`, `stroke:#0f6b4f` 1.1px, `fill:none`) + caixa de CTA verde chapada com botão invertido (cal, hover ocre). É a única peça em line-art da página — foi pedida assim; não converta para massa cheia.

### 5. Caderno (blog)
Post principal com destaque + três posts em lista, cada um com tag mono, data, título Bodoni e resumo. Conteúdo é mock.

## Interações e estados
- Navegação por estado (`view`), sem roteador no protótipo → no app, use rotas reais (`/`, `/mapa`, `/indicar`, `/sobre`, `/caderno`).
- Item de nav ativo: `border-bottom:2px solid #c9902c`; inativo sem borda, hover para `#1b1a16`.
- Hovers: links `#0a4a36`; botão primário verde → `#0a4a36`; botão do CTA cal → ocre `#c9902c` com texto `#1b1a16`; itens do rodapé → ocre.
- Seleção de estabelecimento sincroniza mapa ↔ lista ↔ detalhe (`selectedId`).
- Responsivo por `clamp()`, `auto-fit`/`minmax` e `flex-wrap` — nada de breakpoints fixos além disso.

## Estado necessário
`view`, `selectedId`, `categoryFilter`, `cryptoFilter`, `verifiedOnly`, `search`, `form{name,category,neighborhood,contact,cryptos[],note,submitterName}`, `formSubmitted`, `establishments[]`.

Modelo dos dados de exemplo (alinhar com `Establishment`/`AcceptedPayment` do repo):
`{ id, name, category, neighborhood, verified: boolean, verifiedDate: 'fev/2026'|null, x, y, cryptos: [{ symbol, method }] }`
Derivados calculados na UI: `badgeText` (`Verificado · <data>` vs `Reportado pela comunidade`), `entryNo` (índice com zero-padding), `cryptoLabels` (`BTC · Lightning`), cores de borda/pin. Categorias: Restaurante, Café, Bar, Padaria, Loja, Mercado, Serviço.

Dados de busca/filtro são todos client-side no protótipo; no app, filtros provavelmente viram query params + fetch.

## Flags de protótipo (não precisam existir no app)
`mostrarCalcada` (faixas decorativas), `numerarFichas` (numeração das fichas), `vistaInicial` (tela inicial do protótipo).

## Assets
- `icon.svg` — marca/pin, usada no header, rodapé e favicon.
- Fontes via Google Fonts: Bodoni Moda (400/500/600 + itálicos), Archivo (400/500/600/700), JetBrains Mono (400/500/700).
- Nenhuma imagem raster: todos os gráficos são CSS chapado ou SVG inline. Os slots de foto do Caderno são placeholders com legenda — precisam de fotos reais.

## Arquivos
- `CriptoCuritiba v2.dc.html` — protótipo completo das cinco telas (template + lógica no fim do arquivo).
- `support.js`, `icon.svg` — necessários para abrir o protótipo.
- `CONTEXT.md` — decisões visuais e lista do que foi descartado.

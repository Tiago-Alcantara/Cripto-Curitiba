# CriptoCuritiba — Contexto do Projeto

> Arquivo de contexto para IAs. Leia isto antes de qualquer alteração de design ou código.

## 1. O produto

**CriptoCuritiba** é um hub comunitário web3/cripto de Curitiba. O site é essencialmente **um mapa de estabelecimentos da cidade que aceitam criptomoedas**, mantido pela comunidade.

- Repositório de origem: `Tiago-Alcantara/Cripto-Curitiba` (branch `main`) — ver `github.md`.
- Protótipo atual: `CriptoCuritiba.dc.html` (Design Component, single-file).
- Idioma: **português do Brasil**, sempre.
- Tom de voz: **comunitário e acolhedor**. Fala como vizinho curitibano, não como startup.

### O que o site NÃO é
Não intermedia pagamentos, não custodia cripto, não dá recomendação financeira. Isso é declarado explicitamente na página Sobre e no rodapé — mantenha.

### Fluxo de curadoria (o coração do produto)
1. Qualquer pessoa **sugere** um local pelo formulário.
2. Um **admin verifica** por contato direto ou visita.
3. O local entra no mapa **com selo e data de confirmação**.

Os dois selos são sempre visíveis, nunca escondidos:
- **Verificado · mês/ano** — pill verde sólida, texto creme.
- **Reportado pela comunidade** — pill outline dourada, texto âmbar escuro.

A **data de confirmação** é um diferencial central do produto (diretórios de cripto morrem de desatualização). Nunca remova.

## 2. Páginas

| Tela | Conteúdo |
|---|---|
| **Início** | Hero + valor, 4 cards de diferenciais, locais verificados em destaque, portal do Passeio Público, seção do pinhão, "como a curadoria funciona" (3 passos), CTA final |
| **Mapa** | Busca por nome/bairro, filtros de categoria e cripto, toggle "só verificados", lista de cards + mapa ilustrativo com pins clicáveis e popover |
| **Sugerir local** | Formulário (nome, categoria, bairro, contato, criptos, observação, autor) + estado de sucesso |
| **Sobre** | O projeto, como verificamos, primeiro estabelecimento, o que o site não faz, contato |
| **Blog** | Grid de 4 posts (notícias/guias da cena local) |

Navegação é client-side por estado (`state.view`), não por URL. Sem painel de admin nesta entrega.

## 3. Direção de design (v2 — arquivo atual: `CriptoCuritiba v2.dc.html`)

> `CriptoCuritiba.dc.html` (v1) fica preservado como histórico. **Toda alteração nova vai no v2.**

### Conceito
**Almanaque civil de Curitiba** — o site é um *registro impresso* da cidade, com a gramática da Curitiba eclética de 1886–1930 aplicada à interface. Nada de cartão arredondado genérico: réguas, cornijas, arcadas, numeração de ficha e mosaico de calçada.

Referências reais usadas (traduzidas em formas CSS planas, nunca ilustração):

- **Portal do Passeio Público (1886)** → peça-herói: torres de tijolo (terracota) com pináculo em losango, dois vãos laterais com grade vertical, arco central profundo contendo o mapa com pinhões. É a imagem-assinatura do site.
- **Calçada portuguesa (Largo da Ordem / Rua XV)** → faixa de mosaico em losangos pretos sobre creme, 11px, sob o cabeçalho, acima do rodapé e como divisor na página Sobre. Controlável pela prop `mostrarCalcada`.
- **Arcada de pastilha (trencadís)** → a seção "Os quatro vãos" (`<section id="painel-pastilha">`) é uma **arcada de quatro vãos** em fundo verde-pinheiro: cada vão é uma **vidraça** — arco (`border-radius:76px 76px 2px 2px`) com caixilho creme de 2px, vidro verde (`#20382f` / `#244136` alternando) e montantes de ferro em `repeating-linear-gradient` creme (30px na vertical, 34px na horizontal) —, com **pedra-chave ocre em losango** no ápice, um **motivo curitibano em formas chapadas** atrás do vidro e o **numeral romano em Bodoni sobre uma pastilha inteira creme** na base. Os motivos são **SVGs de massa cheia** (`viewBox="0 0 96 96"`, 68px, **só `fill`** — terracota `#8c2f1b`, ocre `#c9902c` e recortes em cal `#efe9dd`; **nunca traço/hairline**, para casar com a linguagem chapada do herói): I araucária (coroa de três tiers trapezoidais, nunca barras finas), II relógio do Paço da Liberdade, III estação-tubo (**cápsula horizontal** — 80×46 rx23; a versão em cúpula vertical foi rejeitada por ler como sino), IV farol do saber. O vão tem 196px e lê **três registros separados, sem sobreposição**: pedra-chave (y14–30) → motivo 64px (`top:40px;height:64px`, y40–104) → pastilha do numeral (y124–182). Vão IV não usa losangos — repetiriam a pedra-chave. O portal do Passeio Público é exclusivo do herói — não repetir como ícone. Sob cada arco vem uma **placa de cal** (`#efe9dd`, raio 2px) com título em Bodoni e texto em Archivo — **texto real em HTML**, nunca desenhado no mosaico. Fecha com a faixa de calçada portuguesa e legenda em monoespaçada.
  - Grade `repeat(auto-fit,minmax(176px,1fr))` com `gap:3px` (o gap É o rejunte): 4 vãos em telas largas, 2×2 abaixo de ~740px.
- **Estufa do Jardim Botânico (rodapé/CTA)** → **elevação em traço fino** (SVG único, `viewBox="0 0 600 262"`, `max-width:620px`, `stroke:#0f6b4f` 1.1px, `fill:none`), no espírito do pôster de arquitetura que o usuário referenciou: malha de vidro fina ao fundo (verticais 15px, horizontais 18px, opacidade 0.35), corpo com testeiras arredondadas, **três cúpulas** (central rx100/ry86, laterais rx78/ry66) com arcos concêntricos, meridiano, três latitudes e pináculo circular, **arcada de 10 vãos** com arco duplo e **pórtico central de dois vãos fundidos**. Cornija de 7px apoia a caixa de CTA. Esta é a única peça em line-art da página — foi pedida explicitamente; a versão anterior em três naves de CSS foi substituída.

- **Nota — descartado, não repetir**: a tessellação Voronoi única (seed 20260921, Lloyd 2×, paths gerados em `.gen.js`, textos como `<text>` dentro do SVG com `feTurbulence` e semântica em `<h2>`/`<ol>` oculto) **ficou ilegível e foi removida**. Nunca use mosaico irregular como suporte de texto — se voltar, só como fundo atrás de placas sólidas. O painel figurativo de azulejo azul (Poty) e a pastilha quadrada também foram descartados.
- **Cornija de fachada** → divisores de seção = régua grossa (3px) + fina (1px) empilhadas, nunca uma borda solta.
- **Registro civil / livro de tombo** → estabelecimentos são **fichas numeradas** (`№ 001`), com barra lateral de 4px, dados em monoespaçada e selo em forma de carimbo retangular.
- **Estufa do Jardim Botânico (1991)** → faixa de CTA: três volumes de vidro e ferro (duas alas baixas + vault central mais alto) em treliça diagonal verde, pináculo ocre no ápice, painel de vidro com montantes onde vive a chamada, viga verde de base e, abaixo, os canteiros do jardim francês em losangos.
- **Araucária / pinhão** → identidade e todos os marcadores do mapa (mantido do v1).

### Araucária & pinhão (identidade)
Metáfora oficial: **"o pinhão é o nosso pin"**. Pins em forma de semente (`border-radius: 50% 50% 50% 0` + `rotate(45deg)`). Os 3 pinhões da seção são **minimalistas** — duas cores chapadas (`#8c2f1b` corpo, `#4a2013` coroa), sem degradê, sem sombra. **Manter minimalista.**

### Ilustração — regra
Formas CSS planas e geométricas. Sem SVG ilustrativo, sem degradê decorativo, sem sombra de caixa em lugar nenhum (o v2 é *flat com réguas*, não com sombras). Fotos são placeholders listrados com rótulo em monoespaçada entre colchetes: `[ foto da fachada ]`.

### O que NÃO fazer (foi removido justamente por parecer template de IA)
- Cartão branco de raio 16px com sombra.
- Botão pill em tudo.
- Grade de 4 cards com bolinha colorida no topo.
- Badge de hero com pontinho pulsante.
- Layout centralizado e simétrico em tudo.
- Newsreader + Manrope (fontes-padrão genéricas).

## 4. Design System (v2)

### 4.1 Cores

| Token | Hex | Uso |
|---|---|---|
| Papel (cal) | `#efe9dd` | fundo do site |
| Papel faixa | `#e7dfcd` | faixas de estatística e de curadoria |
| Superfície | `#fbf8f1` | fichas, textarea, popover |
| Régua | `#c9bfa8` | bordas finas e divisores secundários |
| Tinta | `#1b1a16` | texto principal, réguas grossas, mosaico |
| Tinta suave | `#3a3630` / `#4a453b` | parágrafos |
| Tinta mudo | `#6a6254` | mono, legendas, eyebrows (4.96:1 — **não clarear**) |
| Tinta em placeholder | `#5f584b` | rótulo sobre foto listrada |
| **Verde-pinheiro escuro** | `#16261f` | faixas escuras, rodapé, campo do mapa, plintos |
| **Verde araucária** | `#0f6b4f` | primária: botão, link, selo verificado |
| Verde profundo | `#0a4a36` | hover, contorno de pin |
| **Ocre Paço** | `#c9902c` | acento: CTA, selo comunidade, pins não verificados, sublinhado do nav ativo |
| Ocre escuro | `#8a5f14` | texto ocre sobre claro |
| Tinta sobre ocre | `#3a2c0a` / `#1b1a16` | **único** texto permitido sobre `#c9902c` (4.86:1 / 6.2:1) |
| **Terracota tijolo** | `#8c2f1b` | torres do portal, pinhão |
| Marrom pinhão | `#4a2013` | coroa do pinhão |
| Creme sobre escuro | `#efe9dd` / `#f3ede0` / `#b9c4bd` | texto em superfície escura |

Máximo 2 fundos por tela (papel + uma faixa). Acentos são pontuais.

### 4.2 Tipografia

- **Bodoni Moda** (didone, 400/500 + itálico) — títulos, nomes de estabelecimento, números grandes, wordmark. **Nunca abaixo de 18px** (as hastes finas somem).
- **Archivo** (grotesca, 400/600/700) — corpo, parágrafos, botões.
- **JetBrains Mono** (400/700) — *toda* metainformação: eyebrows, selos, tags de cripto, datas, números de ficha, legendas, rodapé. É o que dá o tom de "registro".

Regras: eyebrow/label/selo sempre `uppercase` + `letter-spacing` 0.1–0.2em em mono. Botões em Archivo 700, uppercase, `letter-spacing: 0.11em`, 12–12.5px.

Escala: H1 `clamp(30px,5vw,68px)` Bodoni 500 `line-height:0.98–1`; H2 `clamp(26px,3.4vw,40px)`; H3 ficha 19–21px; corpo 15–16.5px `line-height:1.6–1.72`; mono 9.5–11px.

Capitular (drop cap) em Bodoni verde `#0f6b4f` 74px abre a página Sobre.

### 4.3 Forma e espaço

- **Raios: 2–3px em tudo** (botão, ficha, selo, chip, input). Arcos: `60px 60px 0 0` (vão lateral), `130–150px 130px 0 0` (arco central e mapa), `76px 76px 0 0` (arcada dos quatro vãos). Nenhum pill no site. Pin: `50% 50% 50% 0`.
- **Sem box-shadow.** Profundidade vem de régua e contraste.
- Container: `max-width: 1140px`, padding lateral 28px. Texto longo: 680–720px.
- Grids sempre `repeat(auto-fit,minmax(Xpx,1fr))` + `gap`; flex/grid com `gap`, nunca margem entre irmãos.

### 4.4 Componentes

**Botão primário** — `#0f6b4f`, texto `#f3ede0`, `padding:14px 24px`, raio 2px, Archivo 700 12.5px uppercase 0.11em. Hover `#0a4a36`.
**Botão secundário** — transparente, borda `1.5px solid #1b1a16`; hover inverte (fundo tinta, texto papel).
**Botão desabilitado** — borda tracejada `#c9bfa8`, texto `#8a8172`, rótulo diz o que falta.
**Chip de filtro** — retangular 2px; ativo verde sólido, inativo borda `#c9bfa8` com hover para tinta. Archivo 11px uppercase.
**Nav** — sem pill: item ativo = `border-bottom: 2px solid #c9902c`; inativo mudo com hover para régua.
**Ficha de estabelecimento** — `#fbf8f1`, borda 1px `#c9bfa8`, **barra esquerda de 4px** (verde se selecionado, ocre se comunidade), linha mono `№ 003 · BAIRRO` no topo, nome em Bodoni.
**Selo verificado** — retângulo verde sólido, mono 9–10px uppercase 0.12em: `VERIFICADO · FEV/2026`.
**Selo comunidade** — retângulo com **borda tracejada ocre**, texto `#8a5f14`.
**Tag de cripto** — mono 10–10.5px, borda `#c9bfa8`, raio 2px, formato `BTC · Lightning`.
**Input** — sem caixa: apenas `border-bottom: 1.5px solid #c9bfa8`, Archivo 16px, fundo transparente; foco em verde. Só o `textarea` tem caixa.
**Formulário** — é uma **ficha numerada**: cada label é `01 · NOME DO ESTABELECIMENTO` em mono uppercase.
**Mapa ilustrativo** — campo `#16261f` **com topo em arco** (`150px 150px 3px 3px`), grade creme a 9%, duas manchas circulares (parques), pins-pinhão por `%`, popover creme com borda de tinta. Legenda e aviso de "mapa ilustrativo" sempre presentes.
**Blog (Caderno)** — não é grade de cards: uma matéria de capa (imagem + título grande) e as demais em lista com réguas, tag/data em mono à esquerda.

### 4.5 Movimento
Discreto: `fadeInUp 0.5s` na troca de página e hovers. Nada além disso.

### 4.6 Acessibilidade
Texto sempre em opacidade total. Contraste mínimo 4.5:1 (3:1 só em títulos grandes) — vale também para a camada monoespaçada, que é pequena: use `#6a6254` no papel, `#5f584b` sobre placeholder listrado e `#3a2c0a` sobre o ocre `#c9902c` — nunca tons mais claros. Bodoni nunca abaixo de 18px. Pins verificados são creme com contorno verde escuro sobre o campo escuro.

### 4.7 Props do componente (painel de Tweaks)
- `mostrarCalcada` (bool, padrão true) — faixas de calçada portuguesa.
- `numerarFichas` (bool, padrão true) — numeração `№` nas fichas.
- `vistaInicial` (enum) — tela que abre no protótipo.

## 5. Dados (exemplo, 7 locais)

Modelo de cada estabelecimento:
```js
{ id, name, category, neighborhood, verified, verifiedDate, x, y, cryptos: [{ symbol, method }] }
```
Categorias: Restaurante, Café, Bar, Padaria, Loja, Mercado, Serviço.
Criptos: BTC, ETH, USDT — sempre com o método (Lightning, on-chain, Polygon, Tron).
Bairros reais de Curitiba: Centro, Batel, Água Verde, Centro Cívico, Bigorrilho, Alto da XV, Mercês.

**Tartuferia San Paulo** (Centro) é a semente de conteúdo — está entre os primeiros estabelecimentos de Curitiba a aceitar bitcoin. Citada no Início, no Mapa e na página Sobre.

## 6. Marca

`icon.svg` — quadrado verde `#0f6b4f` com raio 16, pinhão/pin creme (círculo + triângulo) e miolo dourado `#d9a441`. Usado como favicon, no cabeçalho (34px) e no rodapé (26px). Wordmark: "CriptoCuritiba" em Newsreader 600.

Redes da comunidade no rodapé: Instagram, X/Twitter, Discord.

## 7. Restrições técnicas

- Arquivo único `CriptoCuritiba.dc.html` — template + classe de lógica.
- **Estilo 100% inline.** Nada de CSS por classe. O único CSS global permitido é reset de body, `@font-face`/`@keyframes` e cor de link.
- Lógica em `class Component extends DCLogic` com `renderVals()`; o template só aceita buscas por caminho (`{{ a.b }}`), nunca expressões.
- Layout fluido: `max-width`, nunca largura fixa; tudo precisa reflowar abaixo de 1000px.
- Referências visuais de componente pedidas pelo usuário: **beui.dev** e **ui.shadcn.com** (densidade, sobriedade, estados limpos) — adaptadas à paleta quente acima, não copiadas.

## 8. Pendências / próximos passos

- Substituir o mapa ilustrativo por mapa real (OpenStreetMap/Leaflet) com coordenadas.
- Fotos reais das fachadas (hoje são placeholders).
- Painel de admin / fila de moderação (fora do escopo desta entrega).
- Persistência real das sugestões (hoje o formulário é protótipo).
- Conteúdo real do blog.

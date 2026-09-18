# 05 — Design

Status: **proposta**. A identidade visual é a primeira decisão da Fase 0 e nada
aqui está fechado — o objetivo do documento é dar um ponto de partida concreto
para aprovar ou recusar, não um manual definitivo.

## Princípios

1. **Clean e minimalista.** Nada do visual "dark/neon de exchange". O produto é um
   guia da cidade que por acaso fala de cripto — a referência estética é
   editorial/guia gastronômico, não trading.
2. **Confiança é o produto.** O selo de verificação e a data de confirmação são
   elementos de primeira classe no card e na página, não letra miúda.
3. **Conteúdo antes de enfeite.** Animação só onde comunica (entrada de lista,
   hover de card, transição de mapa). Nenhuma landing com partículas.
4. **Mobile-first.** A consulta típica acontece na rua, com uma mão.

## Direção visual proposta

Base neutra quente + um acento verde escuro (referência à Curitiba das araucárias
e dos parques, e não ao verde "cripto" saturado).

```css
--background:      #FBFAF8;  /* off-white quente */
--surface:         #FFFFFF;
--border:          #E7E3DC;
--foreground:      #1A1A18;  /* quase preto */
--muted:           #6B6862;
--primary:         #0E5C43;  /* verde pinheiro — CTA, links, pins */
--primary-hover:   #0A4635;
--verified:        #0E5C43;  /* selo verificado — sólido */
--community:       #B4751A;  /* selo comunidade — âmbar, outline */
--danger:          #9B2C2C;
```

Contraste conferido para AA: `#0E5C43` sobre `#FBFAF8` ≈ 8:1; `#6B6862` sobre
`#FBFAF8` ≈ 5:1. Modo escuro fica para depois do lançamento.

**Tipografia:** Inter (UI) + Instrument Serif ou Fraunces nos títulos das páginas
de detalhe, para o tom editorial. Duas famílias, no máximo.

**Formas:** raio 12px em cards, 8px em botões/inputs; sombras quase inexistentes
(borda de 1px em vez de sombra); espaçamento generoso (escala de 4px).

**Iconografia:** Lucide. Ícones de moeda em SVG próprio (cryptocurrency-icons),
servidos localmente — nunca hotlink de CDN de terceiros.

## Selos (elemento central)

| Selo | Visual | Texto |
|---|---|---|
| Verificado | pill sólido verde, ícone de check | `Verificado · fev/2026` |
| Comunidade | pill outline âmbar, ícone de usuários | `Reportado pela comunidade` |
| Desatualizado | pill cinza, aparece se `lastConfirmedAt` > 12 meses | `Confirmar informação` |

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Hero curto com busca, contador ("27 lugares em Curitiba"), destaques verificados, como funciona, CTA de sugestão |
| `/estabelecimentos` | Filtros (bairro, categoria, cripto, método) + alternância lista/mapa; cards |
| `/mapa` | Página dedicada: mapa grande + lista lateral sincronizada, filtro por cripto e por verificação |
| `/estabelecimentos/[slug]` | Galeria, pagamentos aceitos detalhados, endereço + mapa pequeno, horário, contatos, selo + data, "reportar erro" |
| `/sugerir` | Formulário de sugestão (novo/atualização/erro) |
| `/sobre` | Projeto, critérios de verificação, contato, aviso de que o site não intermedia pagamentos |
| `/privacidade` | LGPD, dados coletados, canal de remoção |
| `/admin/*` | Painel: fila de sugestões, lista e editor de estabelecimentos |

## Componentes-chave

- `EstablishmentCard` — foto, nome, categoria, bairro, chips de cripto, selo
- `CryptoChip` — símbolo + método (`BTC · Lightning`)
- `VerificationBadge`
- `FilterBar` — chips multi-seleção, estado refletido na URL (compartilhável)
- `MapView` — cluster de pins, popup com mini-card, sincronizado com a lista
- `SuggestionForm`
- `EmptyState` — "nenhum lugar com esses filtros. Conhece um? Sugira."

## Bibliotecas

- **shadcn/ui** como base de componentes (copiado para o repo, não dependência opaca)
- **Tailwind CSS** com os tokens acima em CSS variables
- **Framer Motion** para as poucas animações necessárias
- **Magic UI / Aceternity UI**: usar com parcimônia — só componentes pontuais que
  caibam no estilo clean. O default dessas libs puxa para o visual "cripto
  chamativo" que este projeto está evitando.
- **Mapa:** ver [ADR-0005](adr/0005-mapa.md) — recomendação: React Leaflet + tiles padrão do OpenStreetMap.

## Referências para fechar a identidade

Sites: land-book.com, godly.website, lapa.ninja, onepagelove.com, siteinspire.com,
mobbin.com. Buscar nas categorias *directory*, *local guide*, *restaurant*.

MCPs úteis durante a implementação do design: Figma Dev Mode MCP (se houver arquivo
Figma), 21st.dev Magic MCP (geração de componentes), Context7 MCP (docs atualizadas
de Next/Tailwind/shadcn).

## Acessibilidade (mínimo obrigatório)

- Contraste AA em todo texto
- Navegação por teclado nos filtros e no formulário
- `alt` em toda foto de estabelecimento (campo existe no banco)
- Informação de cripto aceita **nunca** só por cor — sempre com texto
- Mapa não é a única forma de acessar um local: a lista é completa e navegável

# /brag — Cripto Curitiba

## O que é, em uma frase

Um registro curado dos lugares de Curitiba que aceitam cripto. Cada local tem
um selo de confiança (verificado pela equipe ou reportado pela comunidade) e a
data da última confirmação.

## Perguntas de inspeção

| Pergunta | Resposta |
|---|---|
| O que é? | Mapa e diretório hiperlocal de estabelecimentos que aceitam cripto em Curitiba. |
| Para quem? | Quem tem cripto e mora em (ou visita) Curitiba e quer saber onde gastar; quem conhece um lugar e quer indicar. |
| O que diferencia? | O selo com data ("Cada selo diz quando foi checado"), qual moeda / qual rede, curadoria de vizinho, só Curitiba. |
| Afirmação mais forte | "Diretório de cripto morre de desatualização. Cada selo diz quando foi checado." |
| Gancho visual | Um carimbo verde **VERIFICADO · OUT/2026** batendo em cima de "Aceita cripto? — acho que sim…" |
| UI real a mostrar | `Selo` (os três estados), `FichaIndicacao` (formulário com chips de cripto), `PortalPasseio` (herói), `EstufaCta` (CTA), cabeçalho com calçada portuguesa. |
| Tom | `default`, com o sotaque "almanaque civil" do site: papel de cal, tinta, verde araucária, carimbo. |
| Legenda para postar | "Aceita cripto? Em Curitiba agora tem resposta com data." |

**Sobre os dados:** a produção ainda não tem estabelecimentos publicados, então
o vídeo não mostra nenhum local como se fosse real nem inventa contagem. O único
nome que aparece é "Café das Araucárias", digitado no formulário de indicação.
Esse nome é o próprio placeholder do campo (`ex: Café das Araucárias`).

## Ângulo

**O selo é o produto.** Todo mundo já ouviu "acho que aceita". O Cripto Curitiba
troca o "acho" por um carimbo com data e chama a cidade para preencher o mapa.

- **Gancho:** "Aceita cripto?" → "— acho que sim…" riscado → carimbo verde com data.
- **Revelação:** "Onde usar *cripto* em Curitiba", com o Portal do Passeio Público se montando e pinhões caindo no mapa.
- **Destaque 1:** os três selos reais, carimbados um a um: "Cada selo diz quando foi checado."
- **Destaque 2:** o formulário real de indicação sendo preenchido (nome, ramo, bairro, BTC + Lightning), enviado e recebido, com os 3 passos da curadoria avançando ao lado.
- **Fecho:** a estufa do Jardim Botânico se desenhando em traço verde + o CTA real "Conhece um lugar que aceita cripto?" + endereço do site.

## Identidade visual (do código)

- Cores: papel `#efe9dd`, papel-claro `#fbf8f1`, papel-quente `#e7dfcd`, tinta `#1b1a16`, tinta-média `#4a453b`, tinta-fraca `#6a6254`, régua `#c9bfa8`, pinheiro `#16261f`, verde `#0f6b4f`, ocre `#c9902c`, ocre-escuro `#8a5f14`, terracota `#8c2f1b`, creme `#f3ede0`.
- Fontes: Bodoni Moda (títulos, eixo `opsz` travado em 11, peso 600), Archivo (texto, 500), JetBrains Mono (rótulos em caixa alta).
- Linguagem: tudo chapado, raio de 2px, sem sombra; cornija (régua 3px + 1px); calçada portuguesa em losango.

## Storyboard (landscape 1920×1080, 30 fps, 20,5 s, 120 BPM)

| # | Tempo | Cena | Na tela | Movimento | Som |
|---|---|---|---|---|---|
| 1 | 0,0–3,5 | Gancho | Papel. "Aceita *cripto*?" em Bodoni gigante. Embaixo, em mono: "— acho que sim…" | Palavras sobem (0,1 / 0,3); resposta é digitada (0,9–1,5); risco atravessa (1,75); carimbo **VERIFICADO · OUT/2026** bate em 2,0 com tremida | Motivo de marimba subindo (pergunta); tique de teclado; risco de lápis; **baque do carimbo** no tempo forte, a batida entra |
| 2 | 3,5–7,5 | Revelação | Cabeçalho real (marca, CriptoCuritiba, navegação, calçada); "Almanaque de estabelecimentos · desde 2026"; **Onde usar *cripto* em Curitiba**; botões; Portal do Passeio Público | Cabeçalho desce, calçada corre da esquerda pra direita; título sobe em duas linhas (4,0 / 4,15); torres e arco crescem da base; 3 pinhões caem no mapa (5,0 / 5,5 / 6,0) | Whoosh na entrada; cada pinhão é uma nota de marimba na tonalidade |
| 3 | 7,5–11,0 | Selo | Papel-quente. **Cada selo diz quando foi checado.** Três selos reais: VERIFICADO · OUT/2026 / REPORTADO PELA COMUNIDADE / CONFIRMAR INFORMAÇÃO · SET/2025, cada um com uma legenda curta | Painel sobe cobrindo o herói; selos carimbados em 8,0 / 8,5 / 9,0 | Três baques leves, no tempo |
| 4 | 11,0–16,0 | Indicar | Esquerda: os 3 passos da curadoria (№ 01 A comunidade indica / № 02 A equipe confirma / № 03 O selo é publicado). Direita: a ficha de indicação real | Cursor clica e digita "Café das Araucárias", escolhe "Café", digita "Batel"; câmera desce; botão tracejado "Preencha…" vira "Enviar indicação"; clica BTC e Lightning; envia; vira "Indicação enviada"; o passo ativo avança 01 → 02 → 03 | Tiques de teclado e cliques baixinhos; acorde curto de sucesso |
| 5 | 16,0–20,5 | Fecho | Estufa do Jardim Botânico em traço verde; faixa verde com "Conhece um lugar que aceita cripto?" / "Leva 2 minutos · a equipe confirma antes de publicar" / botão "Indicar local"; ornamentos; marca + `criptocuritiba-web-one.vercel.app` | Estufa se desenha (16,0–17,4); faixa sobe; texto e botão entram; ornamentos acendem um a um | Brilho subindo durante o desenho; acorde final em 18,0, soando até o fim |

Soma: 3,5 + 4,0 + 3,5 + 5,0 + 4,5 = **20,5 s**.

### Transições

- 1→2: o conteúdo do gancho sobe e some (3,25–3,5); o cabeçalho entra por cima, depois o título.
- 2→3: painel papel-quente sobe da base cobrindo o herói (7,25–7,55): nada de fusão de dois layouts.
- 3→4: selos e título saem antes (10,75–11,0); depois o formulário entra pela direita.
- 4→5: a ficha recebida sai (15,75–16,0); a estufa começa a se desenhar no papel limpo.

## Som

Trilha própria, sintetizada: 120 BPM, Fá maior (F – Dm – B♭ – C). Marimba, baixo
redondo, bumbo macio, estalo nos tempos 2 e 4, shaker. Os efeitos ficam dentro da
tonalidade e por baixo da música: carimbo é bumbo grave + batida de madeira,
pinhões são notas da escala, o sucesso é uma terça (Lá → Dó). Acorde final em
18,0 s, deixado soar.

## Pôster

Candidato: o herói assentado (~7,0 s), com título, portal e os três pinhões
plantados. Confirmar comparando com o fecho.

## Como regerar

Os scripts ficam em `work/` (os intermediários são ignorados pelo git).

```bash
cd brag-output/work
node build.mjs && node render.cjs        # renderiza os componentes reais do site -> fragments.json
node montar.mjs                          # Tailwind do site + stage.html
uv run --no-project --with numpy --with scipy python trilha.py   # trilha.wav
node quadros.mjs stills 2.6 7.1 9.6      # confere quadros soltos em stills/
node quadros.mjs video mudo.mp4          # 615 quadros, 30 fps
```

O `render.cjs` precisa de `NODE_PATH=../../apps/web/node_modules:../../packages/shared/node_modules`
e as fontes do site baixadas em `work/fonts/` (Google Fonts: Archivo, Bodoni Moda, JetBrains Mono).

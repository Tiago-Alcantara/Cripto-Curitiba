# Brag Plan: Cripto Curitiba

Rodada `/brag --full` (Hyperframes). Mesmo projeto e mesmo ângulo da rodada
`brag-output/` (brag-slim), agora composta e renderizada pelo Hyperframes, com
efeitos sonoros CC0 do pacote do /brag e beat-sync medido na trilha.

## What is this app?
Um registro curado dos lugares de Curitiba que aceitam cripto, em que cada local
tem um selo de confiança (verificado pela equipe ou reportado pela comunidade) e
a data da última confirmação.

## The angle
**O selo é o produto.** Todo mundo já ouviu "acho que aceita". O Cripto Curitiba
troca o "acho" por um carimbo com data e chama a cidade para preencher o mapa.
A graça vem do próprio produto: um diretório que admite que informação velha
mata diretório ("Diretório de cripto morre de desatualização. Cada selo diz
quando foi checado.").

## Hook (first 2-3 seconds)
"Aceita *cripto*?" gigante em Bodoni. Embaixo, digitado em mono: "— acho que
sim…". Um risco atravessa a resposta e o carimbo verde **VERIFICADO · OUT/2026**
bate por cima no tempo forte da música (2,0 s).

## Key moments (the middle)
- O cabeçalho real desce com a calçada portuguesa correndo; "Onde usar *cripto* em Curitiba" sobe palavra por palavra; o Portal do Passeio Público se ergue da base e três pinhões caem no mapa do arco.
- Os três selos reais carimbados um a um: VERIFICADO · OUT/2026 / REPORTADO PELA COMUNIDADE / CONFIRMAR INFORMAÇÃO · SET/2025, com "Cada selo diz quando foi checado.".
- A ficha de indicação real sendo preenchida e enviada, com os três passos da curadoria avançando ao lado e o selo publicado no passo 03.

## Outro / punchline
A estufa do Jardim Botânico se desenha em traço verde; a faixa verde real sobe
com "Conhece um lugar que aceita cripto?" / "Leva 2 minutos · a equipe confirma
antes de publicar" / botão "Indicar local"; marca + `criptocuritiba-web-one.vercel.app`.

## User flow worth showing
Entrada → ação → resultado na ficha de indicação (`/indicar`): digita o nome
("Café das Araucárias", o placeholder do próprio campo), escolhe "Café", digita
"Batel", marca BTC e Lightning → o botão tracejado "Preencha nome, ramo e bairro"
vira "Enviar indicação" → clica → "Indicação enviada". Os estados vêm do
componente real `FichaIndicacao` renderizado com React.

## Tone
- Preset: default
- Creative direction: almanaque civil de Curitiba, com carimbo de cartório
- Interpretation: ritmo confortável (5 cenas), tudo chapado e editorial como o site; o humor vem do "acho que sim" riscado, não de piada inventada; transições limpas (painel que sobe, cortina que sai), nada de flash.

## Format: landscape — 1920x1080
## Duration: 20,5 s

## Visual identity (from the project)
- Background: papel `#efe9dd` (papel-quente `#e7dfcd`, papel-claro `#fbf8f1`)
- Accent: verde `#0f6b4f`; ocre `#c9902c`; terracota `#8c2f1b`; pinheiro `#16261f`
- Text: tinta `#1b1a16`; tinta-média `#4a453b`; tinta-fraca `#6a6254`
- Display font: Bodoni Moda (eixo `opsz` travado em 11, peso 600)
- Body font: Archivo (500); rótulos em JetBrains Mono caixa alta
- Strongest visual element: o selo (`Selo`), o Portal do Passeio Público (`PortalPasseio`) e a estufa em traço (`EstufaCta`)

## Share copy (draft)
Aceita cripto? "Acho que sim" não serve: no Cripto Curitiba, cada lugar da cidade
que aceita cripto ganha um selo dizendo quem confirmou e quando.

## Audio direction
- Role: warm bed com acentos de carimbo e interface
- Music: trilha própria (`trilha-musica.wav`), sintetizada para este vídeo, 120 BPM, Fá maior (F – Dm – B♭ – C). Escolhida no lugar das faixas do pacote porque a licença delas não está documentada e o vídeo vai ser postado; a trilha própria não tem essa dúvida.
- Music treatment: intro só com pad e marimba (0–2 s), a batida entra no carimbo (2,0 s), compasso da estufa (16–18 s) fica mais leve, acorde final em 18,0 s soando até o fim com fade.
- Music cue guidance: cues detectados com `analyze_music_cues.py` (ver `composition/assets/music/cues/`). Travar: 2,0 s (carimbo do gancho) e 18,0 s (acorde final). Grade de tempos de 0,5 s para os pinhões (5,0 / 5,5 / 6,0) e para os selos (8,0 / 8,5 / 9,0).
- Audio-reactive treatment: sutil; o grave da trilha faz a grade creme do arco do portal e a faixa verde do CTA "respirarem" de leve (opacidade/brilho). Nada de barras ou onda.
- SFX posture: moderado, sempre casado com movimento visível.
- Audio-coupled moments: digitação da resposta e da ficha (teclas), carimbos (baque macio), pinhões pousando (drop), cliques do cursor, envio com sino curto.
- Restraint rule: nada de whoosh em toda transição; nenhum som agudo repetido; os efeitos ficam por baixo da música.

## Storyboard

### Scene 1 — Gancho — 3,5 s
Papel. "Aceita *cripto*?" (Bodoni, ~232 px). "— acho que sim…" digitado (0,9–1,5 s); risco (1,75 s); carimbo VERIFICADO · OUT/2026 (componente `Selo`) bate em 2,0 s com tremida curta. Calçada na base.
Sequential/interaction: sim — digitação caractere a caractere, depois o carimbo.
Audio intent: suspense curto que vira certeza.
Audio-coupled idea: teclas na digitação; baque de carimbo travado em 2,0 s.
Music: pad e marimba sozinhos até o carimbo; a batida entra junto.
Transition mood: clean → Scene 2 (conteúdo sobe e some; cabeçalho desce)

### Scene 2 — Revelação — 4,0 s
Cabeçalho real (marca, CriptoCuritiba, navegação, calçada) + herói da home: "Almanaque de estabelecimentos · desde 2026", **Onde usar *cripto* em Curitiba**, parágrafo, botões, Portal do Passeio Público.
Sequential/interaction: sim — palavras do título uma a uma; torres e arco crescem da base; três pinhões caem (5,0 / 5,5 / 6,0).
Audio intent: abertura, chegada.
Audio-coupled idea: drop suave em cada pinhão.
Transition mood: soft → Scene 3 (painel papel-quente sobe da base)

### Scene 3 — Selo — 3,5 s
Papel-quente. "II · Data de confirmação" / **Cada selo diz quando foi checado.** / três linhas com os selos reais e legendas ("confirmado pela equipe", "indicado pela comunidade", "mais de um ano: checar de novo").
Sequential/interaction: sim — selos carimbados em 8,0 / 8,5 / 9,0; os três ficam juntos na tela até 10,75 (≥ 1,75 s com o conjunto completo, o que cobre a leitura da última linha).
Audio intent: três batidas de cartório.
Audio-coupled idea: baque macio em cada selo, no tempo.
Transition mood: clean → Scene 4 (conteúdo sai antes, painel sai por cima)

### Scene 4 — Indicar — 5,0 s
Esquerda: "Como a curadoria funciona" + № 01 A comunidade indica / № 02 A equipe confirma / № 03 O selo é publicado. Direita: a ficha real em 1,9×.
Sequential/interaction: sim — cursor clica, digita, escolhe, rola, marca BTC e Lightning, envia; passo ativo 01 → 02 (14,32) → 03 (15,0, com selo).
Audio intent: mãos no teclado, depois alívio.
Audio-coupled idea: cliques, teclas (uma sim, outra não), sino curto no "Indicação enviada", baque leve no selo do passo 03.
Transition mood: soft → Scene 5

### Scene 5 — Fecho — 4,5 s
`EstufaCta` real: estufa se desenha (16,0–17,4), faixa verde com CTA e botão, ornamentos acendem (18,0–18,2), marca + endereço.
Sequential/interaction: sim — traço se desenhando; ornamentos do centro pra fora.
Audio intent: resolução.
Audio-coupled idea: arpejo subindo enquanto desenha; acorde final travado em 18,0 s.
Transition mood: — (fim)

Soma: 3,5 + 4,0 + 3,5 + 5,0 + 4,5 = **20,5 s**.

**Music mood for this video:** upbeat, quente, marimba
**Audio summary:** começa íntimo na pergunta, a batida entra com o carimbo, segue leve sob os selos e a ficha, e resolve num acorde de Fá quando o CTA aparece.

## Dados e privacidade
Nenhum estabelecimento aparece como se fosse real (a produção ainda não tem
locais publicados). O único nome na tela é o placeholder do campo de nome. Sem
contagens, sem depoimentos, sem dados pessoais.

## Desvios do componente real (registrados)
- Linha mono do CTA da estufa: `#b9cfc4` → `#cadbd2`. No site ela fica em 3,95:1 sobre o verde; o `check` do Hyperframes exige 4,5:1 e sugeriu essa cor, na mesma família.
- Passos inativos da curadoria em `#8a8274` (em vez de opacidade baixa) para continuar legíveis e passar no contraste.

## Como regerar

```bash
# componentes reais -> fragments.json (ver brag-output/work/)
cd brag-output/work && node build.mjs && \
  NODE_PATH=../../apps/web/node_modules:../../packages/shared/node_modules TZ=America/Sao_Paulo node render.cjs
# trilha sem efeitos
SO_MUSICA=1 SAIDA=../../brag-output-2026-10-02-021555/composition/assets/music/trilha-musica.wav \
  uv run --no-project --with numpy --with scipy python trilha.py
# composicao + Tailwind do site
cd ../../brag-output-2026-10-02-021555 && python3 ferramentas/montar.py && node ferramentas/compilar-css.mjs
# gate e render
cd composition && npx hyperframes check && npx hyperframes render --quality delivery --output ../brag.mp4
```

Depois do render: pôster em 7,1 s (`brag.jpg`) gravado como frame 0 e áudio normalizado para −16 LUFS (o render sai em −22,6 LUFS com a trilha em `data-volume` 0,42).

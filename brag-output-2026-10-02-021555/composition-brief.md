# Hyperframes Composition Brief: Cripto Curitiba

## Objective
Create a short launch-style brag video for Cripto Curitiba.

## Output
- Composition directory: `brag-output-2026-10-02-021555/composition/`
- Rendered video: `brag-output-2026-10-02-021555/brag.mp4`
- Format: landscape — 1920x1080, 30 fps
- Duration: 20,5 s

## Source Material
- Project root: repositório Cripto-Curitiba (monorepo pnpm)
- Primary files read: `apps/web/app/layout.tsx`, `apps/web/app/(site)/layout.tsx`, `apps/web/app/(site)/page.tsx`, `apps/web/app/globals.css`, `apps/web/components/registro/*.tsx`, `apps/web/app/(site)/indicar/page.tsx`, `README.md`, `packages/db/prisma/seeds/*`
- Product name: Cripto Curitiba (marca escrita "CriptoCuritiba")
- Tagline / strongest claim: "Onde usar cripto em Curitiba"; "Cada selo diz quando foi checado."
- Key UI or visual moment to recreate: `Selo` (três estados), `FichaIndicacao` (formulário), `PortalPasseio`, `EstufaCta`, cabeçalho com calçada. O markup vem dos componentes reais renderizados com React (`brag-output/work/render.tsx`) e o CSS é o Tailwind do próprio app compilado sobre esse markup.
- Copy that must appear verbatim:
  - Onde usar cripto em Curitiba
  - Almanaque de estabelecimentos · desde 2026
  - Cada selo diz quando foi checado.
  - Verificado · out/2026 / Reportado pela comunidade / Confirmar informação · set/2025
  - Indicar um local / Toda indicação passa por verificação manual antes de entrar no registro.
  - A comunidade indica / A equipe confirma / O selo é publicado
  - Indicação enviada
  - Conhece um lugar que aceita cripto? / Leva 2 minutos · a equipe confirma antes de publicar / Indicar local

## Creative Direction
- Tone preset: default
- Creative direction: almanaque civil de Curitiba, com carimbo de cartório
- Interpretation: 5 cenas, ritmo confortável, visual chapado e editorial do site; humor só do "acho que sim" riscado.
- Angle: o selo é o produto — trocar o "acho que aceita" por um carimbo com data e chamar a cidade para indicar lugares.
- Hook: "Aceita cripto?" → "— acho que sim…" riscado → carimbo VERIFICADO · OUT/2026 em 2,0 s.
- Outro / punchline: estufa desenhada + CTA real "Conhece um lugar que aceita cripto?" + endereço do site.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Qualquer estabelecimento apresentado como real, números ou depoimentos inventados

## Visual Identity
- Background: `#efe9dd` (papel), `#e7dfcd` (papel-quente)
- Text: `#1b1a16` (tinta), `#4a453b`, `#6a6254`
- Accent: `#0f6b4f` (verde), `#c9902c` (ocre), `#8c2f1b` (terracota), `#16261f` (pinheiro)
- Display font: Bodoni Moda (local, woff2), `opsz` 11, peso 600
- Body font: Archivo (local, woff2), peso 500; JetBrains Mono para rótulos
- Visual references from the project: calçada portuguesa em losango, cornija (régua 3 px + 1 px), raio de 2 px, sem sombra

## Storyboard
Use the storyboard in `brag-plan.md` as the creative contract.

Scene summary:
1. Gancho — 3,5 s — "Aceita cripto?", "— acho que sim…" riscado, carimbo verde
2. Revelação — 4,0 s — cabeçalho + herói real com o Portal e três pinhões
3. Selo — 3,5 s — "Cada selo diz quando foi checado." + três selos reais
4. Indicar — 5,0 s — ficha real preenchida e enviada; passos da curadoria
5. Fecho — 4,5 s — estufa se desenhando + CTA real + endereço

## Audio
- Audio role: warm bed com acentos de carimbo e interface
- Audio arc: íntimo → batida no carimbo → leve sob selos e ficha → acorde final
- Music: `assets/music/trilha-musica.wav` (trilha própria, sem efeitos embutidos)
- Music treatment: data-volume ~0.6 (a trilha já sai masterizada baixa); fade final pela própria trilha; sem ducking
- Music cue guidance: `assets/music/cues/trilha-musica.music-cues.json` (gerado por `analyze_music_cues.py`). Travas: 2,0 s e 18,0 s. Grade: 5,0/5,5/6,0 e 8,0/8,5/9,0.
- Audio-reactive treatment: sutil; grave modula a grade creme do arco do portal e o brilho da faixa verde do CTA.
- Audio-coupled moments:
  - Gancho — teclas na digitação, baque do carimbo (2,0 s)
  - Revelação — drop em cada pinhão
  - Selo — baque macio em cada selo
  - Indicar — cliques, teclas, sino curto no envio, baque no selo do passo 03
  - Fecho — sem SFX extra além do acorde da trilha
- SFX selection guidance: sons quentes e de baixo risco de agudo; teclas em volume baixo e alternadas
- SFX analysis guidance: `/brag` `assets/sfx/sfx-analysis.md`
- Exact SFX choice: definidos na composição depois da animação pronta
- Audio files: `composition/assets/music/` e `composition/assets/sfx/`

## Hyperframes Instructions
Domain skills carregadas: hyperframes-core, hyperframes-animation, hyperframes-creative, hyperframes-keyframes, hyperframes-cli. Uma timeline GSAP pausada (`window.__timelines["main"]`), GSAP local em `assets/vendor/` (sem CDN), fontes locais com `@font-face` no arquivo, `check` sem erros antes do render, criação e render locais.

# Divulgação — vídeo de lançamento

Vídeo curto (2min56s, 1920×1080, narrado em português e com legenda embutida)
anunciando que o site está no ar e explicando a ideia. O `.mp4` não fica no
repositório: ele é gerado a partir dos scripts em [`video/`](video/), que
gravam o próprio site e montam o vídeo — dá pra regravar sempre que o site
mudar.

- [`video-lancamento.srt`](video-lancamento.srt) — legenda separada, para subir
  junto no YouTube/LinkedIn (o vídeo já tem a legenda embutida; o `.srt` deixa
  a plataforma indexar o texto).

> **Sobre os dados que aparecem:** a primeira versão foi gravada com o site
> rodando localmente, com os estabelecimentos fictícios do seed (todos com nome
> "Exemplo ..."). A barra do navegador no vídeo mostra o aviso "dados de
> demonstração" nessas cenas. Quando a curadoria real estiver publicada, vale
> regravar contra produção (passo a passo abaixo) — o aviso some sozinho.

## Roteiro

| Tempo | Cena | O que aparece | Narração |
|---|---|---|---|
| 0:00 | Abertura | Vinheta: logo, "Onde usar cripto em Curitiba", Portal do Passeio Público, selo "o site está no ar" + endereço | Você tem cripto e mora em Curitiba? Ou está só de passagem pela cidade? Então esse vídeo é pra você: o Cripto Curitiba está no ar. |
| 0:10 | Problema | Vinheta escura: "Onde dá pra gastar cripto em Curitiba?" e os 3 problemas dos diretórios atuais | Quem usa cripto aqui sempre esbarra na mesma pergunta: onde dá pra gastar? Os mapas que existem são globais, genéricos e desatualizados. E quase nunca dizem o que importa na hora de pagar: qual moeda o lugar aceita, por qual rede, e se essa informação ainda vale hoje. |
| 0:26 | Solução | Página inicial, herói e contadores do registro | O Cripto Curitiba nasceu pra resolver isso. É um registro vivo da cidade, mantido por quem mora aqui: cafés, bares, restaurantes, lojas e serviços que aceitam Bitcoin e outras criptomoedas. |
| 0:39 | Diferenciais | Zoom em cada um dos "quatro vãos" da home | E ele é diferente de um diretório qualquer por quatro motivos. Primeiro, o selo de verificação: cada local mostra se foi verificado pela equipe ou reportado pela comunidade. Segundo, a data de confirmação, porque informação velha é o que mata um diretório de cripto. Terceiro, a curadoria de vizinho: qualquer pessoa indica, e a equipe confirma antes de publicar. E quarto: é só Curitiba. Só as ruas e os bairros que você conhece. |
| 1:07 | Destaques | "Verificados em campo" e "O pinhão é o nosso pin" | Logo na página inicial você já encontra os locais verificados em campo. E repara no marcador do mapa: é um pinhão, a semente da araucária, símbolo do Paraná. |
| 1:17 | Mapa | Cliques nos filtros: Café → Restaurante → Lightning → Só verificados | No mapa está o registro completo. Dá pra filtrar por ramo, como café, bar ou restaurante. Por moeda, ou só quem aceita pagamento pela rede Lightning. E se quiser ter certeza, é só marcar: só verificados. |
| 1:33 | Busca | Digita "Batel", escolhe o local, card em destaque | Também dá pra buscar pelo nome ou pelo bairro. Escolheu um local? Ele aparece em destaque, com as moedas aceitas e o selo de confiança. |
| 1:44 | Ficha | Ficha completa: selo, "Como pagar em cripto", endereço, "reportar um erro" | Na ficha completa está o que importa na hora de pagar. Não basta dizer que aceita Bitcoin: mostramos a rede, a forma de pagamento e a data em que cada uma foi confirmada. Tem também o endereço, o botão "como chegar", e um atalho pra reportar um erro, caso alguma coisa tenha mudado. |
| 2:01 | Indicar | Preenche a ficha de indicação e envia | Conhece um lugar que aceita cripto e ainda não está no mapa? Indicar leva dois minutos. Você informa o nome, o ramo, o bairro e as moedas aceitas. Toda indicação passa por verificação manual antes de entrar no registro. |
| 2:20 | Transparência | Página Sobre, "O que este site não faz" | E pra ficar claro: o Cripto Curitiba não intermedia pagamentos e não custodia cripto de ninguém. Não é recomendação financeira, e não cobra pra listar ninguém. A gente só mostra onde, em Curitiba, você pode pagar com cripto. |
| 2:35 | Encerramento | Vinheta: estufa do Jardim Botânico, "O site está no ar.", endereço, chamadas | O site já está no ar e pronto pra usar. Acesse, explore o mapa, e se você conhece um lugar que aceita cripto, ou tem um negócio que aceita, indique. Quanto mais gente contribuir, mais completo fica o mapa da cidade. Cripto Curitiba: o lugar pra descobrir onde usar cripto em Curitiba. |

## Texto sugerido para o post

> O **Cripto Curitiba** está no ar! 🌲
>
> Um registro vivo dos cafés, bares, restaurantes e lojas de Curitiba que
> aceitam Bitcoin e outras criptomoedas — com selo de verificação, data da
> última confirmação e o detalhe que importa na hora de pagar: qual moeda,
> por qual rede.
>
> Conhece um lugar que aceita cripto? Indica lá, leva dois minutos.
>
> 👉 https://criptocuritiba-web-one.vercel.app
>
> #bitcoin #cripto #curitiba #lightning

## Como regravar

Tudo roda offline depois de baixar os modelos: a voz é sintetizada localmente
(Piper, voz `pt_BR-faber-medium`, via `sherpa-onnx`) e cada frase é conferida
com Whisper — frase que sai mal pronunciada é gerada de novo.

Requisitos: Node 22, Python 3.11+, `ffmpeg` no PATH.

```bash
cd docs/divulgacao/video
npm install                      # playwright (fora do workspace pnpm)
npx playwright install chromium
pip install sherpa-onnx soundfile numpy pillow

# modelos de voz e de transcricao (ficam em modelos/, ignorado pelo git; o Whisper
# e opcional: sem ele a narracao e gerada sem a conferencia de pronuncia)
mkdir -p modelos && cd modelos
curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2 | tar xj
curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj
cd ..
```

Passo a passo (com o site rodando — local com `pnpm dev`, ou produção):

```bash
pnpm --filter @cripto/web build  # na raiz: baixa as fontes do site
npm run fontes                   # copia as fontes para o palco do video

npm run narracao                 # roteiro.json -> narracao.wav, timing.json, legendas.srt
npm run captura                  # grava as telas do site em assets/
npm run stills                   # opcional: confere alguns quadros em stills/
npm run video                    # -> video-lancamento.mp4 (~10 min)
```

Para gravar contra produção, com dado real:

```bash
SITE_URL=https://criptocuritiba-web-one.vercel.app \
FICHA=<slug-de-um-local-verificado> BUSCA=<bairro-desse-local> \
npm run captura
```

A captura responde o envio do formulário de indicação ali mesmo, então
gravar contra produção **não** cria sugestão na fila de moderação.

### Como funciona

| Arquivo | Papel |
|---|---|
| `roteiro.json` | Narração por cena: texto da legenda, grafia falada (quando difere) e pausas |
| `narracao.py` | TTS frase a frase, verificação com Whisper, `timing.json` e `.srt` |
| `captura.mjs` | Playwright navega no site, clica/digita e salva cada estado em 2x, com as caixas dos elementos |
| `recorta.py` | Recorta ilustrações e o cabeçalho sticky das capturas de página inteira |
| `palco.html` | O "palco" 1920×1080: vinhetas, janela de navegador, cursor, destaques e legenda — tudo função do tempo |
| `render.mjs` | A direção (câmera, cursor e destaques sincronizados com cada frase), renderização quadro a quadro e `ffmpeg` |

Mudou o texto? Edite `roteiro.json` e rode `narracao` + `video`: as cenas se
ajustam sozinhas ao novo tempo das frases. Mudou o site? Rode `captura` de
novo — se um elemento usado na direção mudar de nome, a captura falha
dizendo qual.

"""Monta composition/index.html a partir do template e dos componentes reais do site.

Entrada: brag-output/work/fragments.json (React renderToStaticMarkup dos
componentes reais; ver brag-output/work/render.tsx) e brag-output/work/fonts/.
Saida: composition/index.html. Depois rode compilar-css.mjs para o Tailwind.
"""

import json
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SAIDA = AQUI.parent / 'composition'
WORK = AQUI.parent.parent / 'brag-output' / 'work'

F = json.loads((WORK / 'fragments.json').read_text())
html = (AQUI / 'index.src.html').read_text()


def trecho(fonte: str, tag: str) -> str:
    m = re.search(rf'<{tag}\b.*?</{tag}>', fonte, re.S)
    assert m, tag
    return m.group(0)


# cabecalho: sem sticky, marca local
header = trecho(F['layout'], 'header')
header = header.replace('class="sticky top-0 z-[1100] bg-papel"', 'class="bg-papel"')
header = header.replace('src="/marca.svg"', 'src="assets/marca.svg"')

# heroi: titulo palavra a palavra, pinhoes dentro de um invólucro animavel
heroi = trecho(F['home'], 'section')
heroi = re.sub(
    r'(<h1 [^>]*>).*?(</h1>)',
    r'\1<span class="palavra">Onde</span> <span class="palavra">usar</span> '
    r'<em class="palavra font-normal italic">cripto</em> <span class="palavra">em</span> '
    r'<span class="palavra">Curitiba</span>\2',
    heroi,
    count=1,
    flags=re.S,
)


def pino(m: re.Match) -> str:
    topo, esquerda, resto = m.group(1), m.group(2), m.group(3)
    resto = resto.replace('h-[15px] w-[15px] ', '')
    return f'<div class="pino" style="top:{topo}%;left:{esquerda}%"><div class="pinhao {resto}"></div></div>'


heroi, n = re.subn(r'<div class="pinhao absolute top-\[(\d+)%\] left-\[(\d+)%\] (.*?)"></div>', pino, heroi)
assert n == 3, n

# estados da ficha: ids viram data-id (cada estado repete os mesmos campos)
fichas = []
for nome in ['fichaVazia', 'fichaPreenchida', 'fichaBtc', 'fichaBtcLn', 'fichaEnviando', 'fichaRecebida']:
    corpo = re.sub(r' id="', ' data-id="', F[nome])
    fichas.append(f'<div class="ficha-estado" data-estado="{nome}">{corpo}</div>')

# estufa: tracos com pathLength=1 para desenhar sem medir; legenda escondida
estufa = F['estufa']
estufa = re.sub(r'<(path|circle) ', r'<\1 pathLength="1" stroke-dasharray="1" ', estufa)
estufa = estufa.replace('<section class="', '<section style="padding-top:34px;padding-bottom:0" class="', 1)
estufa = re.sub(r'(<p class="mt-3 mb-0 text-center[^"]*")', r'\1 style="visibility:hidden"', estufa)
# no video a linha mono do CTA precisa de 4,5:1 sobre o verde (o check do Hyperframes sugeriu #cadbd2)
estufa = estufa.replace('text-[#b9cfc4]', 'text-[#cadbd2]')

fontes = (WORK / 'fonts' / 'fonts.css').read_text()
fontes = re.sub(r'src: url\(([^)]+)\)', r'src: url(assets/fonts/\1)', fontes)

audio = json.loads((SAIDA / 'assets' / 'data' / 'audio-data.json').read_text())
audio_min = {'fps': audio['fps'], 'frames': [{'bands': [round(b, 3) for b in q['bands'][:2]]} for q in audio['frames']]}

ALVOS = {
    'nome': {'x': 1123, 'y': 475},
    'ramo': {'x': 894, 'y': 644},
    'bairro': {'x': 1492, 'y': 650},
    'btc': {'x': 700, 'y': 993},
    'ln': {'x': 1491, 'y': 993},
    'enviar': {'x': 844, 'y': 1673},
    'alturaRecebida': 705,
    'cam1': -563,
    'cam2': -843,
}

# ---- efeitos (CC0, Kenney, do pacote do /brag) ----
sfx = []
faixa = [11]


def som(t: float, arquivo: str, vol: float, dur: float | None = None) -> None:
    i = len(sfx) + 1
    d = f' data-duration="{dur}"' if dur else ''
    sfx.append(
        f'<audio id="sfx-{i:02d}" src="assets/sfx/{arquivo}" data-start="{t:.3f}"{d} '
        f'data-track-index="{faixa[0]}" data-volume="{vol}"></audio>'
    )
    faixa[0] += 1


TECLAS = ['003', '006', '009', '012', '015', '018', '021', '024', '027', '030']
# gancho: 15 caracteres entre 0,9 e 1,5 s
for k in range(1, 16):
    som(0.9 + (k - 0.5) * 0.6 / 15, f'keyboard/keypress-{TECLAS[k % 10]}.wav', 0.32, 0.25)
# carimbo do gancho: pousa em 2,09 s (tempo forte em 2,02 s)
som(2.06, 'impact/impactSoft_heavy_003.ogg', 0.8)
som(2.06, 'impact/impactWood_medium_001.ogg', 0.45)
# pinhoes pousando
for t, arq in [(5.0, 'drop_001'), (5.5, 'drop_002'), (6.0, 'drop_003')]:
    som(t, f'interface/{arq}.ogg', 0.6)
# painel dos selos subindo
som(7.25, 'casino/card-slide-1.ogg', 0.35)
# tres selos
for t, arq in [(8.0, 'impactSoft_medium_001'), (8.5, 'impactSoft_medium_004'), (9.0, 'impactSoft_medium_002')]:
    som(t, f'impact/{arq}.ogg', 0.72)
# ficha: cliques
for t in [11.5, 12.25, 12.5, 13.35, 13.6, 14.05]:
    som(t, 'ui/mouseclick1.ogg', 0.6)
# ficha: digitacao (uma tecla sim, outra nao)
for k in range(1, 20, 2):
    som(11.55 + (k - 0.5) * 0.6 / 19, f'keyboard/keypress-{TECLAS[k % 10]}.wav', 0.26, 0.25)
for k in range(1, 6, 2):
    som(12.5 + (k - 0.5) * 0.25 / 5, f'keyboard/keypress-{TECLAS[(k + 3) % 10]}.wav', 0.26, 0.25)
# indicacao enviada e selo publicado no passo 03
som(14.32, 'impact/impactBell_heavy_000.ogg', 0.42)
som(15.06, 'impact/impactSoft_medium_003.ogg', 0.6)

subs = {
    '/*FONTFACE*/': fontes,
    '{{HEADER}}': header,
    '{{HERO}}': heroi,
    '{{SELO_VERIFICADO}}': F['seloVerificado'],
    '{{SELO_COMUNIDADE}}': F['seloComunidade'],
    '{{SELO_VENCIDO}}': F['seloVencido'],
    '{{FICHAS}}': ''.join(fichas),
    '{{ESTUFA}}': estufa,
    '{{MARCA_TOP}}': '878',
    '/*ALVOS*/ null': json.dumps(ALVOS),
    '/*AUDIO_DATA*/ null': json.dumps(audio_min, separators=(',', ':')),
    '{{SFX}}': '\n      '.join(sfx),
}
for chave, valor in subs.items():
    assert chave in html, chave
    html = html.replace(chave, valor)

(SAIDA / 'index.html').write_text(html)
print('index.html', len(html), 'bytes,', len(sfx), 'efeitos')

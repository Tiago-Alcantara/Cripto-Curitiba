"""Recorta ilustracoes e cabecalhos (sticky) das capturas de pagina inteira."""
import json
from PIL import Image, ImageChops

m = json.load(open('captura.json'))
D = m['dsf']
PAPEL = (0xEF, 0xE9, 0xDD)

def recorte_justo(img, caixa, folga=16):
    x0, y0, x1, y1 = [int(v * D) for v in caixa]
    reg = img.crop((x0, y0, x1, y1)).convert('RGB')
    fundo = Image.new('RGB', reg.size, PAPEL)
    diff = ImageChops.difference(reg, fundo).convert('L').point(lambda p: 255 if p > 18 else 0)
    bb = diff.getbbox()
    f = folga * D
    return reg.crop((max(bb[0] - f, 0), max(bb[1] - f, 0), min(bb[2] + f, reg.width), min(bb[3] + f, reg.height)))

home = Image.open(m['shots']['home_full']['arquivo'])
c = m['caixas']
# estufa: entre o topo da secao final e o topo da faixa verde do CTA
cta_topo = c['home_cta']['y'] - 40
estufa = recorte_justo(home, (150, cta_topo - 340, 1290, cta_topo - 4))
estufa.save('assets/ilustra_estufa.png')
p = c['home_pinhao']
pinhoes = recorte_justo(home, (p['x'] + p['w'] * 0.55, p['y'] + 10, p['x'] + p['w'] - 10, p['y'] + p['h'] - 10))
pinhoes.save('assets/ilustra_pinhoes.png')
for nome, im in (('ilustra_estufa', estufa), ('ilustra_pinhoes', pinhoes)):
    m['shots'][nome] = {'arquivo': f'assets/{nome}.png', 'w': im.width / D, 'h': im.height / D, 'offsetY': 0}

CAB = 78
for full in ('home_full', 'mapa_full', 'mapa_b_full', 'ficha_full', 'ind_full', 'sobre_full'):
    im = Image.open(m['shots'][full]['arquivo'])
    nome = 'cab_' + full.replace('_full', '')
    im.crop((0, 0, im.width, CAB * D)).save(f'assets/{nome}.png')
    m['shots'][nome] = {'arquivo': f'assets/{nome}.png', 'w': m['viewport']['w'], 'h': CAB, 'offsetY': 0}
    m['shots'][full]['cabecalho'] = nome
m['alturaCabecalho'] = CAB
json.dump(m, open('captura.json', 'w'), indent=2)
print('estufa', estufa.size, 'pinhoes', pinhoes.size)

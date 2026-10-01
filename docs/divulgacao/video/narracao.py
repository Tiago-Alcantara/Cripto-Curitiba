"""Gera a narracao frase a frase (TTS offline, voz pt_BR) e o timing.json."""
import json, os, sys
import numpy as np, sherpa_onnx, soundfile as sf

TTS_DIR = os.environ.get('TTS_DIR', 'modelos/vits-piper-pt_BR-faber-medium')
SPEED = float(os.environ.get('TTS_SPEED', '1.05'))
GAP = 0.35  # pausa padrao entre frases
TROCAS = {'{BTC}': 'Bitcóin', '{LN}': 'laitenin'}

cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{TTS_DIR}/pt_BR-faber-medium.onnx',
        tokens=f'{TTS_DIR}/tokens.txt', data_dir=f'{TTS_DIR}/espeak-ng-data'), num_threads=4))
tts = sherpa_onnx.OfflineTts(cfg)

# Confere cada frase com Whisper e regera as que sairem mal pronunciadas (o
# VITS e estocastico: a mesma frase as vezes engole uma silaba).
import difflib, re, unicodedata
ASR_DIR = os.environ.get('ASR_DIR', 'modelos/sherpa-onnx-whisper-small')
asr = None
if os.path.isdir(ASR_DIR):
    asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{ASR_DIR}/small-encoder.int8.onnx',
        decoder=f'{ASR_DIR}/small-decoder.int8.onnx', tokens=f'{ASR_DIR}/small-tokens.txt',
        language='pt', task='transcribe', num_threads=4)

def normaliza(txt):
    txt = unicodedata.normalize('NFD', txt.lower())
    txt = ''.join(ch for ch in txt if unicodedata.category(ch) != 'Mn')
    txt = txt.replace('pra ', 'para ').replace('crypto', 'cripto').replace('lightning', 'laitenin').replace('bitcoin', 'bitcoin')
    return re.sub(r'[^a-z0-9 ]+', ' ', txt).split()

def transcreve(am, sr):
    n = int(len(am) * 16000 / sr)
    x = np.interp(np.linspace(0, len(am) - 1, n), np.arange(len(am)), am).astype('float32')
    x = np.concatenate([np.zeros(8000, 'float32'), x, np.zeros(16000, 'float32')])
    st = asr.create_stream(); st.accept_waveform(16000, x); asr.decode_stream(st)
    return st.result.text

def nota(esperado, ouvido):
    return difflib.SequenceMatcher(None, normaliza(esperado), normaliza(ouvido)).ratio()

roteiro = json.load(open('roteiro.json'))
os.makedirs('audio', exist_ok=True)
t = 0.0
cenas, pista = [], []
sr = None
for cena in roteiro:
    inicio = t
    t += cena.get('pre', 0.6)
    frases = []
    for i, (texto, falado) in enumerate(cena['frases']):
        falado = falado or texto
        for k, v in TROCAS.items():
            falado = falado.replace(k, v)
        esperado = texto.replace('Bitcoin', 'bitcoin')
        melhor = None
        for tentativa in range(8):
            a = tts.generate(falado, sid=0, speed=SPEED)
            sr = a.sample_rate
            am = np.array(a.samples, dtype=np.float32)
            if asr is None:
                melhor = (1.0, am, ''); break
            ouvido = transcreve(am, sr)
            n = nota(esperado, ouvido)
            if melhor is None or n > melhor[0]:
                melhor = (n, am, ouvido)
            if n >= 0.97:
                break
        amostras = melhor[1]
        print(f"  {cena['id']}_{i}: {melhor[0]:.2f}  {melhor[2]}", file=sys.stderr)
        arq = f"audio/{cena['id']}_{i}.wav"
        sf.write(arq, amostras, sr)
        dur = len(amostras) / sr
        frases.append({'texto': texto, 'falado': falado, 'inicio': round(t, 3), 'fim': round(t + dur, 3), 'arquivo': arq})
        pista.append((t, amostras))
        t += dur
        if i < len(cena['frases']) - 1:
            t += GAP + cena.get('gapAfter', {}).get(str(i), 0)
    t += cena.get('post', 0.6)
    cenas.append({'id': cena['id'], 'inicio': round(inicio, 3), 'fim': round(t, 3), 'frases': frases})

total = t
mix = np.zeros(int(total * sr) + sr, dtype=np.float32)
for ini, am in pista:
    p = int(ini * sr)
    mix[p:p + len(am)] += am
sf.write('narracao.wav', mix, sr)
json.dump({'duracao': round(total, 3), 'cenas': cenas}, open('timing.json', 'w'), ensure_ascii=False, indent=2)
def srt_tempo(seg):
    ms = int(round(seg * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'

# legendas .srt (para subir junto com o video no YouTube/LinkedIn)
frases = [f for c in cenas for f in c['frases']]
with open('legendas.srt', 'w', encoding='utf-8') as srt:
    for n, f in enumerate(frases, 1):
        prox = frases[n] if n < len(frases) else None
        fim = min(f['fim'] + 0.5, prox['inicio'] - 0.05) if prox else f['fim'] + 0.45
        srt.write(f"{n}\n{srt_tempo(f['inicio'] - 0.05)} --> {srt_tempo(fim)}\n{f['texto']}\n\n")

for c in cenas:
    print(f"{c['id']:14s} {c['inicio']:7.2f} -> {c['fim']:7.2f}  ({c['fim']-c['inicio']:.1f}s)")
print('total', round(total, 1), 's')

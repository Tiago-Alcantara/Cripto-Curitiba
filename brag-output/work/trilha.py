"""Trilha e efeitos do /brag, sintetizados juntos: 120 BPM, Fa maior, 20,5 s.

Os tempos dos efeitos sao os mesmos do anim.js (carimbos, cliques, digitacao,
pinhoes, sucesso, acorde final), e cada efeito afinado fica na tonalidade.
"""

import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 20.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

musica = np.zeros((N, 2))
efeitos = np.zeros((N, 2))


def hz(nota: str) -> float:
    nomes = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
    nome, oitava = nota[:-1], int(nota[-1])
    midi = 12 * (oitava + 1) + nomes[nome]
    return 440.0 * 2 ** ((midi - 69) / 12)


def por(buf, t, sinal, ganho=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sinal = sinal[: N - i]
    esq = np.cos((pan + 1) * np.pi / 4)
    dir_ = np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(sinal), 0] += sinal * ganho * esq * 1.414
    buf[i : i + len(sinal), 1] += sinal * ganho * dir_ * 1.414


def filtro(x, tipo, corte, ordem=2):
    sos = butter(ordem, corte, btype=tipo, fs=SR, output='sos')
    return sosfilt(sos, x)


def tempo(d):
    return np.arange(int(d * SR)) / SR


# ---------------- instrumentos ----------------
def marimba(f, d=0.9, brilho=1.0):
    t = tempo(d)
    corpo = np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5)
    p4 = 0.32 * brilho * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22)
    p10 = 0.08 * brilho * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 45)
    ataque = np.minimum(1, t / 0.002)
    return (corpo + p4 + p10) * ataque


def baixo(f, d):
    t = tempo(d + 0.08)
    s = 0.8 * np.sin(2 * np.pi * f * t) + 0.42 * np.sin(4 * np.pi * f * t) + 0.18 * np.sin(6 * np.pi * f * t) + 0.07 * np.sin(8 * np.pi * f * t)
    env = np.minimum(1, t / 0.008) * np.where(t < d, np.exp(-t * 1.6), np.exp(-d * 1.6) * np.exp(-(t - d) * 60))
    return s * env


def pad(freqs, d, ataque=0.6, soltura=0.8):
    t = tempo(d + soltura)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.0, 0.0045):
            s += np.sin(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28))
            s += 0.18 * np.sin(4 * np.pi * f * (1 + det) * t)
    env = np.minimum(1, t / ataque) * np.where(t < d, 1.0, np.exp(-(t - d) * 4.5))
    return filtro(s / (3 * len(freqs)), 'low', 2200) * env


def bumbo(f0=110, f1=44, d=0.32):
    t = tempo(d)
    freq = f1 + (f0 - f1) * np.exp(-t * 28)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(fase) * np.exp(-t * 9) * np.minimum(1, t / 0.001)


def estalo():
    t = tempo(0.16)
    ruido = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for atraso in (0.0, 0.011, 0.022):
        env += np.where(t >= atraso, np.exp(-(t - atraso) * 70), 0)
    return filtro(ruido, 'band', [1100, 3200]) * env * 0.5


def chocalho(d=0.06):
    t = tempo(d)
    return filtro(rng.standard_normal(len(t)), 'high', 6500) * np.exp(-t * 60)


def tique():
    t = tempo(0.03)
    return filtro(rng.standard_normal(len(t)), 'band', [2500, 7000]) * np.exp(-t * 260) + 0.25 * np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 300)


def clique():
    t = tempo(0.05)
    corpo = filtro(rng.standard_normal(len(t)), 'band', [1500, 5000]) * np.exp(-t * 180)
    return corpo + 0.35 * np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 150)


def carimbo(f_raiz, forca=1.0):
    t = tempo(0.5)
    queda = f_raiz * 0.5 + f_raiz * 1.2 * np.exp(-t * 35)
    fase = 2 * np.pi * np.cumsum(queda) / SR
    baque = np.sin(fase) * np.exp(-t * 11)
    madeira = filtro(rng.standard_normal(len(t)), 'band', [220, 900]) * np.exp(-t * 55) * 1.6
    papel = filtro(rng.standard_normal(len(t)), 'high', 3000) * np.exp(-t * 90) * 0.35
    return (baque + madeira + papel) * forca


def risco():
    t = tempo(0.18)
    s = filtro(rng.standard_normal(len(t)), 'band', [1800, 4200])
    env = np.sin(np.pi * t / 0.18) ** 1.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 38 * t))
    return s * env * 0.45


def whoosh(d=0.42):
    t = tempo(d)
    ruido = rng.standard_normal(len(t))
    blocos = 256
    saida = np.zeros_like(ruido)
    for i in range(0, len(t), blocos):
        k = i / len(t)
        centro = 300 + 2600 * k**1.3
        bloco = filtro(ruido[max(0, i - 2048) : i + blocos], 'band', [centro * 0.6, centro * 1.5])
        saida[i : i + blocos] = bloco[-len(saida[i : i + blocos]) :]
    env = (np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2) * np.minimum(1, (d - t) / 0.06 + 0.0)
    return saida * env * 0.5


def subida(d):
    t = tempo(d)
    ruido = filtro(filtro(rng.standard_normal(len(t)), 'high', 1500), 'low', 7000)
    return ruido * (t / d) ** 2.2 * 0.11


# ---------------- arranjo ----------------
BPM = 120
BATIDA = 60 / BPM
COMPASSO = 4 * BATIDA

ACORDES = {
    'F': (['F4', 'A4', 'C5'], 'F2', ['F4', 'A4', 'C5', 'A4', 'F5', 'C5', 'A4', 'C5']),
    'Dm': (['D4', 'F4', 'A4'], 'D2', ['D4', 'F4', 'A4', 'F4', 'D5', 'A4', 'F4', 'A4']),
    'Bb': (['D4', 'F4', 'Bb4'], 'Bb1', ['Bb4', 'D5', 'F5', 'D5', 'Bb4', 'F4', 'D5', 'F5']),
    'C': (['E4', 'G4', 'C5'], 'C2', ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E5', 'G5']),
}
# compasso -> acorde (cada compasso = 2 s)
GRADE = {1: 'F', 2: 'Dm', 3: 'Bb', 4: 'C', 5: 'F', 6: 'Dm', 7: 'Bb', 8: 'C'}

# intro (0 - 2 s): pad suave e o motivo da pergunta
por(musica, 0.0, pad([hz('F3'), hz('A3'), hz('C4')], 2.0, ataque=0.9, soltura=0.3), 0.16)
for t0, nota, g in [(0.10, 'C5', 0.32), (0.28, 'F5', 0.34), (0.95, 'A5', 0.16), (1.2, 'G5', 0.14), (1.48, 'E5', 0.14)]:
    por(musica, t0, marimba(hz(nota)), g, pan=0.15)

for c, nome in GRADE.items():
    inicio = c * COMPASSO
    tri, raiz, arp = ACORDES[nome]
    # pad
    por(musica, inicio, pad([hz(n) for n in tri], COMPASSO * 0.98), 0.10)
    # baixo sincopado
    r = hz(raiz)
    quinta = r * 1.5
    for off, f, d, g in [(0.0, r, 0.42, 0.27), (0.75, r, 0.2, 0.19), (1.0, quinta, 0.42, 0.22), (1.5, r, 0.4, 0.22)]:
        por(musica, inicio + off, baixo(f, d), g)
    # bateria: bumbo 1 e 3, estalo 2 e 4, chocalho em colcheias
    for b in range(4):
        tb = inicio + b * BATIDA
        if c == 8:
            # compasso do desenho da estufa: so chocalho e bumbo leve, abrindo espaco pro acorde final
            if b in (0, 2):
                por(musica, tb, bumbo(), 0.24)
        else:
            if b in (0, 2):
                por(musica, tb, bumbo(), 0.42)
            if b in (1, 3):
                por(musica, tb, estalo(), 0.32, pan=-0.1)
        for meio in (0, 0.25):
            por(musica, tb + meio, chocalho(), 0.05 if meio else 0.035, pan=0.35)
    # marimba em colcheias
    if c == 8:
        # arpejo subindo enquanto a estufa se desenha
        subindo = ['C5', 'E5', 'G5', 'C6', 'E5', 'G5', 'C6', 'E6', 'G5', 'C6', 'E6', 'G6', 'C6', 'E6', 'G6', 'Bb6']
        for i, n in enumerate(subindo):
            por(musica, inicio + i * 0.125, marimba(hz(n), 0.6), 0.09 + 0.006 * i, pan=0.2 if i % 2 else -0.2)
    else:
        for i, n in enumerate(arp):
            g = 0.2 if i % 2 == 0 else 0.13
            por(musica, inicio + i * 0.25, marimba(hz(n)), g, pan=0.25 if i % 2 else -0.15)

# acorde final em 18 s, deixado soar
por(musica, 18.0, pad([hz('F3'), hz('A3'), hz('C4'), hz('G4')], 2.0, ataque=0.02, soltura=0.5), 0.2)
por(musica, 18.0, baixo(hz('F1'), 1.9), 0.26)
por(musica, 18.0, baixo(hz('F2'), 1.9), 0.2)
por(musica, 18.0, bumbo(90, 40, 0.6), 0.42)
for nota, g, pan in [('F5', 0.26, -0.2), ('A5', 0.22, 0.2), ('C6', 0.2, -0.1), ('F6', 0.16, 0.1)]:
    por(musica, 18.0, marimba(hz(nota), 2.2), g, pan=pan)
por(musica, 18.0, filtro(rng.standard_normal(int(SR * 1.6)), 'band', [4000, 11000]) * np.exp(-tempo(1.6) * 3.2), 0.05)

# ---------------- efeitos (mesmos tempos do anim.js) ----------------
# 1 · gancho
for i in range(15):
    por(efeitos, 0.9 + i * 0.6 / 15 + rng.uniform(-0.008, 0.008), tique(), 0.16, pan=rng.uniform(-0.2, 0.2))
por(efeitos, 1.75, risco(), 0.7)
por(efeitos, 2.0, carimbo(hz('F2'), 1.0), 0.9)
for nota, g in [('F4', 0.22), ('A4', 0.18), ('C5', 0.18), ('F5', 0.14)]:
    por(musica, 2.0, marimba(hz(nota), 1.2), g)
# transicoes
for t0 in (3.38, 7.2, 10.92, 15.7):
    por(efeitos, t0, whoosh(), 0.35)
# 2 · pinhoes caindo no mapa
for t0, nota in [(5.0, 'A5'), (5.5, 'D6'), (6.0, 'F6')]:
    por(efeitos, t0, marimba(hz(nota), 0.7, brilho=1.3), 0.2, pan=0.3)
    por(efeitos, t0, clique(), 0.12, pan=0.3)
# 3 · selos
for t0, raiz, nota in [(8.0, 'C2', 'C5'), (8.5, 'E2', 'E5'), (9.0, 'G1', 'G5')]:
    por(efeitos, t0, carimbo(hz(raiz), 0.7), 0.6)
    por(efeitos, t0, marimba(hz(nota), 0.8), 0.12)
# 4 · ficha de indicacao
for t0 in (11.5, 12.25, 12.5):
    por(efeitos, t0, clique(), 0.2, pan=0.25)
for i in range(19):
    por(efeitos, 11.55 + i * 0.6 / 19 + rng.uniform(-0.006, 0.006), tique(), 0.12, pan=0.25)
for i in range(5):
    por(efeitos, 12.55 + i * 0.2 / 5, tique(), 0.12, pan=0.25)
for t0, nota in [(13.35, 'F5'), (13.6, 'A5')]:
    por(efeitos, t0, clique(), 0.2, pan=0.25)
    por(efeitos, t0, marimba(hz(nota), 0.5), 0.12, pan=0.25)
por(efeitos, 14.05, clique(), 0.24, pan=0.25)
por(efeitos, 14.32, marimba(hz('A5'), 0.9, brilho=1.2), 0.24, pan=0.2)
por(efeitos, 14.40, marimba(hz('C6'), 1.1, brilho=1.2), 0.24, pan=0.2)
por(efeitos, 15.0, carimbo(hz('F2'), 0.6), 0.5, pan=-0.3)
# 5 · fecho
por(efeitos, 16.0, subida(2.0), 1.0)
for t0, nota in [(18.1, 'A6'), (18.2, 'C7')]:
    por(efeitos, t0, marimba(hz(nota), 0.5), 0.06)

# ---------------- mixagem ----------------
musica = filtro(musica.T, 'high', 38).T
efeitos = filtro(efeitos.T, 'high', 60).T
# efeitos por baixo da musica e no mesmo espaco: um pouco de reverb curto compartilhado
mix = musica * 0.9 + efeitos * 0.75


def reverb(x, tamanho=0.9, mistura=0.14):
    t = tempo(tamanho)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-t * 6.0)[:, None]
    ir = filtro(ir.T, 'low', 5000).T
    ir /= np.sqrt((ir**2).sum(axis=0))
    from scipy.signal import fftconvolve

    molhado = np.stack([fftconvolve(x[:, k], ir[:, k])[: len(x)] for k in range(2)], axis=1)
    return x + molhado * mistura


mix = reverb(mix)
# fade in curtinho e cauda ate o fim
fade = np.ones(N)
fade[: int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR))
cauda = np.arange(N) / SR
fade *= np.where(cauda > 19.6, np.clip(1 - (cauda - 19.6) / 0.9, 0, 1) ** 1.5, 1)
mix *= fade[:, None]
# compressao suave (soft clip) e normalizacao de pico
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 0.89 / np.max(np.abs(mix))

pcm = (mix * 32767).astype(np.int16)
with wave.open('trilha.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('trilha.wav', DUR, 's')

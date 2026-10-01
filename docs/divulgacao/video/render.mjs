// Monta a linha do tempo (direcao) a partir de timing.json + captura.json,
// renderiza o palco quadro a quadro e entrega para o ffmpeg.
//   node render.mjs                 -> video.mp4
//   node render.mjs --stills 3,40   -> stills/t3.png, stills/t40.png
//   node render.mjs --de 77 --ate 105 --saida trecho.mp4
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const FPS = Number(opt('--fps', 30));

const timing = JSON.parse(await readFile('timing.json', 'utf8'));
const M = JSON.parse(await readFile('captura.json', 'utf8'));
const C = M.caixas;
const cena = Object.fromEntries(timing.cenas.map((c) => [c.id, c]));
const S = (id) => cena[id].inicio;
const X = (id) => cena[id].fim;
const F = (id, i) => cena[id].frases[i].inicio;
const E = (id, i) => cena[id].frases[i].fim;
const centro = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const VW = M.viewport.w,
  VH = M.viewport.h;
// camera: limita a regiao visivel a pagina
const cam = (t, cx, cy, w = VW, alturaPagina = Infinity) => {
  const h = (w * VH) / VW;
  cx = Math.max(w / 2, Math.min(VW - w / 2, cx));
  cy = Math.max(h / 2, Math.min(alturaPagina - h / 2, cy));
  return { t, cx, cy, w };
};

// cursor: cada alvo e uma chegada; entre alvos ele fica parado e so parte
// `dur` segundos antes da proxima chegada (padrao 0.75s)
function trajeto(alvos) {
  const kf = [];
  alvos.forEach((a, i) => {
    if (i > 0) {
      const ant = alvos[i - 1];
      const parte = Math.max(ant.t + 0.25, a.t - (a.dur ?? 0.75));
      if (parte > ant.t) kf.push({ t: parte, x: ant.x, y: ant.y });
    }
    kf.push({ t: a.t, x: a.x, y: a.y });
  });
  return kf;
}

// ---------------------------------------------------------------- marcas dos cartoes
const marcas = {
  ab_logo: 0.25,
  ab_kicker: 0.55,
  ab_titulo: 0.85,
  ab_portal: 1.15,
  ab_noar: F('abertura', 2) + 1.5,
  pr_kicker: S('problema') + 0.5,
  pr_titulo: F('problema', 0) + 1.6,
  pr_1: F('problema', 1) + 0.9,
  pr_2: F('problema', 1) + 2.4,
  pr_3: F('problema', 2) + 2.2,
  en_estufa: S('encerramento') + 0.5,
  en_titulo: F('encerramento', 0) + 0.1,
  en_url: F('encerramento', 0) + 1.3,
  en_mapa: F('encerramento', 1) + 1.0,
  en_indicar: F('encerramento', 1) + 4.6,
  en_assinatura: F('encerramento', 3) - 0.1,
  en_rodape: F('encerramento', 2) + 0.5,
};

// ---------------------------------------------------------------- camadas de topo
const FADE_CARTAO = 0.6,
  FADE_JANELA = 0.7;
const fimVideo = timing.duracao;
const janela = {
  id: 'janela',
  t0: S('solucao') - FADE_JANELA,
  t1: S('encerramento') + FADE_JANELA,
  fade: FADE_JANELA,
};
const camadas = [
  { id: 'abertura', t0: 0, t1: S('problema') + FADE_CARTAO, fade: 0 },
  { id: 'problema', t0: S('problema') - 0.1, t1: janela.t0 + FADE_JANELA, fade: FADE_CARTAO },
  janela,
  { id: 'encerramento', t0: S('encerramento') - 0.2, t1: fimVideo + 1, fade: FADE_JANELA },
];

// ---------------------------------------------------------------- telas (dentro da janela)
const telas = [];
const HOME_H = M.shots.home_full.h;

// INICIO: solucao + diferenciais + destaques numa tomada so (rolagem continua)
{
  const vaos = [0, 1, 2, 3].map((i) => C[`home_vao_${i}`]);
  const secVaos = C.home_vaos;
  const cyVaos = secVaos.y + secVaos.h / 2;
  const kf = [
    cam(janela.t0, 600, 330, 1160, HOME_H),
    cam(F('solucao', 1), 720, 405, VW, HOME_H),
    cam(F('solucao', 2) + 1.2, 720, 405, VW, HOME_H),
    cam(F('solucao', 2) + 3.2, 720, 625, VW, HOME_H),
    cam(F('diferenciais', 0) + 0.2, 720, 625, VW, HOME_H),
    cam(F('diferenciais', 0) + 1.8, 720, cyVaos, VW, HOME_H),
  ];
  const destaques = [
    {
      t0: F('solucao', 2) + 3.4,
      t1: X('solucao') - 0.1,
      ...C.home_numeros,
      x: 160,
      w: 1120,
      pad: 4,
    },
  ];
  vaos.forEach((v, i) => {
    const fr = F('diferenciais', i + 1);
    const c = centro(v);
    kf.push(cam(fr - 0.5, c.x, c.y - 20, 900, HOME_H));
    kf.push(cam(fr + 0.3, c.x, c.y - 20, 900, HOME_H));
    destaques.push({
      t0: fr - 0.1,
      t1: i < 3 ? F('diferenciais', i + 2) - 0.45 : E('diferenciais', 4) + 0.1,
      ...v,
      pad: 6,
    });
  });
  const ver = C.home_verificados,
    pin = C.home_pinhao;
  kf.push(
    cam(E('diferenciais', 4) - 0.6, centro(vaos[3]).x, centro(vaos[3]).y - 20, 900, HOME_H),
    cam(E('diferenciais', 4) + 0.6, 720, cyVaos, VW, HOME_H),
    cam(F('destaques', 0) + 0.2, 720, cyVaos, VW, HOME_H),
    cam(F('destaques', 0) + 1.5, 720, ver.y + ver.h / 2 - 10, VW, HOME_H),
    cam(F('destaques', 1) - 0.1, 720, ver.y + ver.h / 2 - 10, VW, HOME_H),
    cam(F('destaques', 1) + 1.2, 720, pin.y + pin.h / 2, 1180, HOME_H),
    cam(X('destaques') + 0.6, 760, pin.y + pin.h / 2, 1100, HOME_H),
  );
  const cards = { x: ver.x + 24, y: C.home_card_0.y, w: ver.w - 48, h: C.home_card_0.h };
  destaques.push({ t0: F('destaques', 0) + 1.8, t1: E('destaques', 0) + 0.2, ...cards, pad: 10 });
  destaques.push({
    t0: F('destaques', 1) + 1.6,
    t1: E('destaques', 1) + 0.2,
    x: pin.x + pin.w * 0.6,
    y: pin.y + 40,
    w: pin.w * 0.36,
    h: pin.h - 80,
    pad: 4,
  });
  telas.push({
    url: '/',
    t0: janela.t0,
    t1: S('mapa') + 0.6,
    fade: 0,
    quadros: [{ t: 0, shot: 'home_full', xf: 0 }],
    cam: kf,
    destaques,
  });
}

// MAPA: filtros + busca + selecao
{
  const R = M.rolagemMapa;
  const H = M.shots.mapa_full.h;
  const ZW = 1180; // zoom da cena (filtros + lista legiveis)
  const ZH = (ZW * VH) / VW;
  const cyR = R + 78 + ZH / 2 - 8; // logo abaixo do cabecalho sticky
  const t0 = S('mapa') - 0.2;
  const q = [{ t: 0, shot: 'mapa_full', xf: 0 }];
  const kf = [
    cam(t0, 720, VH / 2, VW, H),
    cam(F('mapa', 0) + 0.2, 720, VH / 2, VW, H),
    cam(F('mapa', 0) + 1.5, 720, cyR, ZW, H),
  ];
  q.push({ t: F('mapa', 0) + 1.55, shot: 'mapa_0', xf: 0 });
  const cursor = [],
    cliques = [];
  const ir = (t, b, dx = 0, dy = 0) => {
    const c = centro(b);
    cursor.push({ t, x: c.x + dx, y: c.y + dy });
  };
  const clicar = (t, shot, xf = 0.2) => {
    cliques.push(t);
    if (shot) q.push({ t: t + 0.08, shot, xf });
  };
  // ramo
  cursor.push({ t: F('mapa', 1) - 0.2, x: 1000, y: R + 620 });
  ir(F('mapa', 1) + 0.7, C.mapa_cafe);
  clicar(F('mapa', 1) + 0.8, 'mapa_f_cafe');
  ir(F('mapa', 1) + 2.0, C.mapa_restaurante);
  clicar(F('mapa', 1) + 2.1, 'mapa_f_rest');
  // moeda
  ir(F('mapa', 2) - 0.6, C.mapa_ramo_todos);
  clicar(F('mapa', 2) - 0.5, 'mapa_f_todos');
  ir(F('mapa', 2) + 1.4, C.mapa_lightning);
  clicar(F('mapa', 2) + 1.5, 'mapa_f_ln');
  // so verificados
  ir(F('mapa', 3) + 1.5, C.mapa_verificados, -50);
  clicar(F('mapa', 3) + 1.6, 'mapa_f_ln_ver');
  // busca
  ir(F('busca', 0) + 0.5, C.mapa_busca, -60);
  clicar(F('busca', 0) + 0.6, 'mapa_b_0', 0.3);
  const termo = M.termoBusca;
  for (let i = 1; i <= termo.length; i++)
    q.push({ t: F('busca', 0) + 1.0 + i * 0.17, shot: `mapa_b_${i}`, xf: 0 });
  cursor.push({
    t: F('busca', 0) + 1.0 + termo.length * 0.17,
    x: centro(C.mapa_busca).x - 60,
    y: centro(C.mapa_busca).y,
  });
  ir(F('busca', 1) - 0.6, C.mapa_b_item, -40);
  clicar(F('busca', 1) - 0.5, 'mapa_b_sel', 0.15);
  // desce ate o card do local selecionado
  const card = C.mapa_b_card;
  const cyCard = card.y + card.h + 40 - ZH / 2;
  q.push({ t: F('busca', 1) + 0.3, shot: 'mapa_b_full', xf: 0 });
  kf.push(cam(F('busca', 1) + 0.4, 720, cyR, ZW, H), cam(F('busca', 1) + 1.8, 720, cyCard, ZW, H));
  // o cursor acompanha a rolagem (fica parado na tela, nao na pagina)
  const desl = cyCard - cyR;
  const pItem = centro(C.mapa_b_item);
  cursor.push({ t: F('busca', 1) + 0.4, x: pItem.x - 40, y: pItem.y });
  cursor.push({ t: F('busca', 1) + 1.8, x: pItem.x - 40, y: pItem.y + desl, dur: 1.4 });
  ir(E('busca', 1) - 0.6, C.mapa_b_ficha);
  cursor.push({ t: E('busca', 1) + 0.1, ...centro(C.mapa_b_ficha) });
  clicar(E('busca', 1) + 0.2, null);
  const destaques = [{ t0: F('busca', 1) + 2.0, t1: E('busca', 1) + 0.1, ...card, pad: 6 }];
  telas.push({
    url: '/mapa',
    t0,
    t1: E('busca', 1) + 1.2,
    fade: 0.5,
    quadros: q,
    cam: kf,
    cursor: trajeto(cursor),
    cliques,
    destaques,
    cursorFim: E('busca', 1) + 0.6,
  });
}

// FICHA do estabelecimento
{
  const H = M.shots.ficha_full.h;
  const t0 = E('busca', 1) + 0.45;
  const pagar = C.ficha_pagar,
    end = C.ficha_endereco,
    erro = C.ficha_erro;
  const kf = [
    cam(t0, 720, VH / 2, VW, H),
    cam(F('ficha', 0) + 0.3, 720, VH / 2, VW, H),
    cam(F('ficha', 0) + 1.6, 640, 330, 1100, H),
    cam(F('ficha', 1) - 0.1, 640, 330, 1100, H),
    cam(F('ficha', 1) + 1.1, 720, pagar.y + pagar.h / 2, 1000, H),
    cam(E('ficha', 1) + 0.2, 720, pagar.y + pagar.h / 2, 980, H),
    cam(F('ficha', 2) + 1.2, 720, (end.y + erro.y + erro.h) / 2, 1100, H),
  ];
  const cursor = [
    { t: F('ficha', 2) + 1.0, x: 980, y: erro.y + 150 },
    { t: F('ficha', 2) + 2.1, ...centro(C.ficha_chegar) },
    { t: F('ficha', 2) + 3.4, ...centro(C.ficha_chegar) },
    { t: F('ficha', 2) + 4.2, ...centro(C.ficha_erro_link) },
  ];
  const destaques = [
    { t0: F('ficha', 0) + 1.4, t1: E('ficha', 0) + 0.2, ...C.ficha_selo, pad: 8 },
    {
      t0: F('ficha', 1) + 1.2,
      t1: E('ficha', 1) + 0.3,
      ...pagar,
      y: pagar.y + 40,
      h: pagar.h - 40,
      pad: 10,
    },
    { t0: F('ficha', 2) + 0.9, t1: F('ficha', 2) + 2.6, ...end, pad: 8 },
    { t0: F('ficha', 2) + 3.6, t1: X('ficha') + 0.2, ...erro, pad: 6 },
  ];
  telas.push({
    url: `/estabelecimentos/${M.ficha}`,
    t0,
    t1: S('indicar') + 0.6,
    fade: 0.5,
    quadros: [{ t: 0, shot: 'ficha_full', xf: 0 }],
    cam: kf,
    cursor: trajeto(cursor),
    destaques,
  });
}

// INDICAR
{
  const H = M.shots.ind_full.h;
  const t0 = S('indicar') - 0.1;
  const q = [{ t: 0, shot: 'ind_0', xf: 0 }];
  const kf = [
    cam(t0, 720, VH / 2, VW, H),
    cam(F('indicar', 0) + 0.4, 720, VH / 2, VW, H),
    cam(F('indicar', 0) + 2.6, 720, 440, 1150, H),
  ];
  const cursor = [],
    cliques = [];
  const ir = (t, b, dx = 0) => {
    const c = centro(b);
    cursor.push({ t, x: c.x + dx, y: c.y });
  };
  const clicar = (t, shot, xf = 0.15) => {
    cliques.push(t);
    if (shot) q.push({ t: t + 0.08, shot, xf });
  };
  let t = E('indicar', 0) - 0.2;
  cursor.push({ t, x: 980, y: 720 });
  t += 0.7;
  ir(t, C.ind_nome, -150);
  clicar(t + 0.1, null);
  const nome = M.nomeIndicado;
  t += 0.25;
  for (let i = 1; i <= nome.length; i++) q.push({ t: t + i * 0.075, shot: `ind_n_${i}`, xf: 0 });
  t += nome.length * 0.075 + 0.25;
  ir(t, C.ind_ramo, -40);
  clicar(t + 0.1, 'ind_ramo');
  t += 0.7;
  ir(t, C.ind_bairro, -60);
  clicar(t + 0.1, null);
  t += 0.2;
  const bairro = M.bairroIndicado;
  for (let i = 1; i <= bairro.length; i++) q.push({ t: t + i * 0.09, shot: `ind_b_${i}`, xf: 0 });
  t += bairro.length * 0.09 + 0.35;
  ir(t, C.ind_btc);
  clicar(t + 0.1, 'ind_btc');
  t += 0.6;
  ir(t, C.ind_ln);
  clicar(t + 0.1, 'ind_ln');
  t += 0.45;
  q.push({ t, shot: 'ind_full', xf: 0.2 });
  const enviar = C.ind_enviar;
  const cyFim = enviar.y + enviar.h + 30 - (1150 * VH) / VW / 2;
  kf.push(cam(t, 720, 440, 1150, H), cam(t + 1.1, 720, cyFim, 1150, H));
  // cursor parado na tela durante a rolagem
  const ultimo = centro(C.ind_ln);
  cursor.push({ t: t + 1.1, x: ultimo.x, y: ultimo.y + (cyFim - 440), dur: 1.1 });
  t += 1.5;
  ir(t, enviar);
  clicar(t + 0.15, null);
  const tEnvio = t + 0.3;
  telas.push({
    url: '/indicar',
    t0,
    t1: tEnvio + 0.5,
    fade: 0.5,
    quadros: q,
    cam: kf,
    cursor: trajeto(cursor),
    cliques,
    cursorFim: tEnvio + 0.2,
  });
  // confirmacao
  const msg = C.ind_ok_msg;
  telas.push({
    url: '/indicar',
    t0: tEnvio,
    t1: S('transparencia') + 0.6,
    fade: 0.4,
    quadros: [{ t: 0, shot: 'ind_ok', xf: 0 }],
    cam: [cam(tEnvio, 720, msg.y + 140, 1150, VH), cam(X('indicar'), 720, msg.y + 140, 1040, VH)],
  });
}

// SOBRE: o que o site nao faz
{
  const H = M.shots.sobre_full.h;
  const t0 = S('transparencia') - 0.1;
  const it = [0, 1, 2, 3].map((i) => C[`sobre_item_${i}`]);
  const h2 = C.sobre_naofaz;
  const cyLista = (h2.y + it[3].y + it[3].h) / 2;
  const kf = [
    cam(t0, 720, VH / 2, VW, H),
    cam(F('transparencia', 0) + 0.6, 720, VH / 2, VW, H),
    cam(F('transparencia', 0) + 2.2, 720, cyLista, 980, H),
    cam(E('transparencia', 1) + 0.2, 720, cyLista, 940, H),
    cam(X('transparencia') + 0.5, 720, cyLista + 40, 1200, H),
  ];
  const uniao = (a, b) => ({ x: a.x - 24, y: a.y, w: Math.max(a.w, b.w) + 24, h: b.y + b.h - a.y });
  const destaques = [
    {
      t0: F('transparencia', 0) + 2.4,
      t1: E('transparencia', 0) + 0.1,
      ...uniao(it[0], it[1]),
      pad: 8,
    },
    {
      t0: F('transparencia', 1) + 0.1,
      t1: E('transparencia', 1) + 0.2,
      ...uniao(it[2], it[3]),
      pad: 8,
    },
  ];
  telas.push({
    url: '/sobre',
    t0,
    t1: janela.t1,
    fade: 0.5,
    quadros: [{ t: 0, shot: 'sobre_full', xf: 0 }],
    cam: kf,
    destaques,
  });
}

// ---------------------------------------------------------------- legendas
const temaDe = (id) => (['abertura', 'encerramento'].includes(id) ? 'claro' : 'escuro');
const legendas = [];
for (const c of timing.cenas) {
  c.frases.forEach((f, i) => {
    const prox = c.frases[i + 1];
    const fim = prox ? Math.min(f.fim + 0.5, prox.inicio - 0.05) : f.fim + 0.45;
    legendas.push({ t0: f.inicio - 0.05, t1: fim, texto: f.texto, tema: temaDe(c.id) });
  });
}

// gravado fora do localhost = dado real: some o aviso de "dados de demonstracao"
const demo = /localhost|127\.0\.0\.1/.test(M.base ?? 'localhost');
const timeline = { marcas, camadas, janela, telas, legendas, fim: fimVideo, demo };
await writeFile('timeline.json', JSON.stringify(timeline, null, 1));

// ---------------------------------------------------------------- render
const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
page.on('console', (m) => {
  if (m.type() === 'error') console.error('palco:', m.text());
});
page.on('pageerror', (e) => console.error('palco erro:', e.message));
await page.goto(pathToFileURL(resolve('palco.html')).href);
await page.evaluate(async ([tl, m]) => window.montar(tl, m), [timeline, M]);

const stills = opt('--stills');
if (stills) {
  await mkdir('stills', { recursive: true });
  for (const s of stills.split(',').map(Number)) {
    await page.evaluate((t) => window.quadro(t), s);
    await page.screenshot({ path: `stills/t${s}.png` });
  }
  await browser.close();
  console.log('stills ok');
  process.exit(0);
}

const de = Number(opt('--de', 0));
const ate = Number(opt('--ate', fimVideo));
const saidaArq = opt('--saida', 'video.mp4');
const total = Math.round((ate - de) * FPS);
const ff = spawn(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'image2pipe',
    '-framerate',
    String(FPS),
    '-c:v',
    'mjpeg',
    '-i',
    '-',
    '-ss',
    String(de),
    '-t',
    String(ate - de),
    '-i',
    'narracao.wav',
    '-filter:a',
    'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000',
    '-c:v',
    'libx264',
    '-preset',
    opt('--preset', 'slow'),
    '-crf',
    opt('--crf', '18'),
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(FPS),
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    saidaArq,
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

const inicio = Date.now();
for (let i = 0; i < total; i++) {
  const t = de + i / FPS;
  await page.evaluate((t) => window.quadro(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 300 === 0) {
    const el = (Date.now() - inicio) / 1000;
    console.log(`quadro ${i}/${total} (${(t).toFixed(1)}s)  ${el.toFixed(0)}s decorridos`);
  }
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('ok:', saidaArq);

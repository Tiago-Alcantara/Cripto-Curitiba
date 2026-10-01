// Navega pelo site, tira os screenshots de cada estado (2x) e registra as
// caixas dos elementos que a direcao do video usa (coordenadas de pagina, px CSS).
//
//   SITE_URL      site a gravar (padrao http://localhost:3000)
//   FICHA         slug do estabelecimento mostrado na ficha completa
//   BUSCA         termo digitado na busca do mapa
//   BLOQUEAR_TILES=1  aborta os tiles do OpenStreetMap (ambiente sem acesso a eles)
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const FICHA = process.env.FICHA ?? 'exemplo-bistro-batel';
const BUSCA = process.env.BUSCA ?? 'Batel';
const OUT = 'assets';
const VW = 1440;
const VH = 810;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
if (process.env.BLOQUEAR_TILES === '1') {
  await page.route(/tile\.openstreetmap\.org/, (r) => r.abort());
}
// A indicacao do video nunca chega na API: o POST do formulario e respondido
// aqui mesmo, entao gravar contra producao nao cria sugestao na fila.
await page.route('**/api/sugestoes', (r) =>
  r.request().method() === 'POST'
    ? r.fulfill({ status: 201, contentType: 'application/json', body: '{}' })
    : r.continue(),
);

const manifesto = {
  base: BASE,
  ficha: FICHA,
  viewport: { w: VW, h: VH },
  dsf: 2,
  shots: {},
  caixas: {},
};

const espera = (ms) => page.waitForTimeout(ms);
const rolar = async (y) => {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await espera(250);
};
const scrollY = () => page.evaluate(() => window.scrollY);

async function shot(nome, { full = false } = {}) {
  const arquivo = `${OUT}/${nome}.png`;
  await page.screenshot({ path: arquivo, fullPage: full });
  const dims = await page.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    y: window.scrollY,
  }));
  manifesto.shots[nome] = {
    arquivo,
    w: VW,
    h: full ? dims.h : VH,
    offsetY: full ? 0 : dims.y,
  };
}

async function caixa(nome, locator) {
  const b = await locator.first().boundingBox();
  if (!b) throw new Error(`sem caixa: ${nome}`);
  const y = await scrollY();
  manifesto.caixas[nome] = { x: b.x, y: b.y + y, w: b.width, h: b.height };
}

async function clip(nome, locatorOuCaixa, pad = 0) {
  let b = locatorOuCaixa;
  if (typeof locatorOuCaixa.boundingBox === 'function') {
    await locatorOuCaixa.first().scrollIntoViewIfNeeded();
    const r = await locatorOuCaixa.first().boundingBox();
    const y = await scrollY();
    b = { x: r.x, y: r.y + y, w: r.width, h: r.height };
  }
  const arquivo = `${OUT}/${nome}.png`;
  await page.screenshot({
    path: arquivo,
    fullPage: true,
    clip: { x: b.x - pad, y: b.y - pad, width: b.w + pad * 2, height: b.h + pad * 2 },
  });
  manifesto.shots[nome] = { arquivo, w: b.w + pad * 2, h: b.h + pad * 2, offsetY: 0 };
}

async function abrir(caminho) {
  await page.goto(BASE + caminho, { waitUntil: 'networkidle' });
  // fontes + animacao de entrada (0.5s)
  await page.evaluate(() => document.fonts.ready);
  await espera(900);
}

const secaoDe = (texto) =>
  page.locator('section', { has: page.getByRole('heading', { name: texto }) });

// ---------------------------------------------------------------- inicio
await abrir('/');
await caixa('home_h1', page.getByRole('heading', { level: 1 }));
await caixa('home_numeros', page.locator('section', { hasText: /locais no registro/i }));
await caixa('home_vaos', secaoDe(/Por que este registro/));
const vaos = secaoDe(/Por que este registro/).locator('article');
for (let i = 0; i < 4; i++) await caixa(`home_vao_${i}`, vaos.nth(i));
await caixa('home_verificados', secaoDe('Verificados em campo'));
await caixa('home_card_0', secaoDe('Verificados em campo').locator('article').nth(0));
await caixa('home_pinhao', secaoDe(/pinhão é o nosso pin/));
await caixa(
  'home_curadoria',
  page.locator('section', {
    has: page.getByRole('heading', { name: 'Como a curadoria funciona' }),
  }),
);
await caixa('home_cta', page.getByText('Conhece um lugar que aceita cripto?'));
await rolar(0);
await shot('home_full', { full: true });
await clip('ilustra_portal', page.locator('figure', { hasText: /Portal do Passeio/i }), 12);
// ---------------------------------------------------------------- mapa
await abrir('/mapa');
await shot('mapa_full', { full: true });
// o cabecalho e sticky (78px): rolar so ate os filtros ficarem logo abaixo dele
const ROLAGEM_MAPA = 150;
await rolar(ROLAGEM_MAPA);
manifesto.rolagemMapa = ROLAGEM_MAPA;
const ramo = page.locator('fieldset').nth(0);
const moeda = page.locator('fieldset').nth(1);
await caixa('mapa_busca', page.getByPlaceholder('Buscar por nome ou bairro'));
await caixa('mapa_cafe', ramo.getByRole('button', { name: 'Café', exact: true }));
await caixa('mapa_restaurante', ramo.getByRole('button', { name: 'Restaurante', exact: true }));
await caixa('mapa_ramo_todos', ramo.getByRole('button', { name: 'Todos', exact: true }));
await caixa('mapa_lightning', moeda.getByRole('button', { name: 'Lightning', exact: true }));
await caixa('mapa_verificados', moeda.getByText('Só verificados'));
await caixa('mapa_lista', page.locator('ul').filter({ has: page.locator('li button') }));
await caixa('mapa_arco', page.locator('.leaflet-container'));
await shot('mapa_0');

const clicar = async (loc, nome) => {
  await loc.first().click();
  await espera(900);
  await rolar(ROLAGEM_MAPA);
  await shot(nome);
};
await clicar(ramo.getByRole('button', { name: 'Café', exact: true }), 'mapa_f_cafe');
await clicar(ramo.getByRole('button', { name: 'Restaurante', exact: true }), 'mapa_f_rest');
await clicar(ramo.getByRole('button', { name: 'Todos', exact: true }), 'mapa_f_todos');
await clicar(moeda.getByRole('button', { name: 'Lightning', exact: true }), 'mapa_f_ln');
await clicar(moeda.getByText('Só verificados'), 'mapa_f_ln_ver');

// busca: estado limpo de novo
await abrir('/mapa');
await rolar(ROLAGEM_MAPA);
const busca = page.getByPlaceholder('Buscar por nome ou bairro');
await busca.click();
await espera(200);
await rolar(ROLAGEM_MAPA);
await shot('mapa_b_0');
const termo = BUSCA;
for (let i = 1; i <= termo.length; i++) {
  await page.keyboard.type(termo[i - 1]);
  await espera(i === termo.length ? 900 : 120);
  await rolar(ROLAGEM_MAPA);
  await shot(`mapa_b_${i}`);
}
manifesto.termoBusca = termo;
const item = page.locator('ul li button').first();
await caixa('mapa_b_item', item);
await item.first().click();
await espera(700);
await rolar(ROLAGEM_MAPA);
await shot('mapa_b_sel');
await caixa('mapa_b_card', page.getByLabel('Local selecionado'));
await caixa('mapa_b_ficha', page.getByRole('link', { name: /Ver ficha completa/i }));
await page.mouse.move(1435, 805);
await rolar(0);
await espera(200);
await shot('mapa_b_full', { full: true });

// ---------------------------------------------------------------- ficha
await abrir(`/estabelecimentos/${FICHA}`);
await caixa('ficha_h1', page.getByRole('heading', { level: 1 }));
await caixa(
  'ficha_selo',
  page
    .locator('article')
    .getByText(/Verificado ·/i)
    .first(),
);
await caixa(
  'ficha_pagar',
  page.locator('section', { has: page.getByRole('heading', { name: 'Como pagar em cripto' }) }),
);
await caixa(
  'ficha_endereco',
  page.locator('section', { has: page.getByRole('heading', { name: 'Endereço' }) }),
);
await caixa('ficha_chegar', page.getByRole('link', { name: /Como chegar/i }));
await caixa('ficha_erro', page.getByText(/Alguma informação está errada/));
await caixa('ficha_erro_link', page.getByRole('link', { name: /Reportar um erro/i }));
await rolar(0);
await shot('ficha_full', { full: true });

// ---------------------------------------------------------------- indicar
await abrir('/indicar');
await rolar(0);
const nome = page.getByPlaceholder('ex: Café das Araucárias');
const ramoSel = page.locator('select').first();
const bairro = page.getByPlaceholder('ex: Batel');
await caixa('ind_nome', nome);
await caixa('ind_ramo', ramoSel);
await caixa('ind_bairro', bairro);
await caixa('ind_btc', page.getByRole('button', { name: 'BTC', exact: true }));
await caixa('ind_ln', page.getByRole('button', { name: 'Lightning', exact: true }));
await shot('ind_0');
await nome.click();
const nomeLocal = 'Exemplo Café Araucária';
manifesto.nomeIndicado = nomeLocal;
for (let i = 1; i <= nomeLocal.length; i++) {
  await page.keyboard.type(nomeLocal[i - 1]);
  await shot(`ind_n_${i}`);
}
const valorCafe = await ramoSel.evaluate(
  (s) => [...s.options].find((o) => /caf/i.test(o.text))?.value,
);
await ramoSel.selectOption(valorCafe);
await espera(200);
await shot('ind_ramo');
await bairro.click();
const nomeBairro = 'Centro';
manifesto.bairroIndicado = nomeBairro;
for (let i = 1; i <= nomeBairro.length; i++) {
  await page.keyboard.type(nomeBairro[i - 1]);
  await shot(`ind_b_${i}`);
}
await page.getByRole('button', { name: 'BTC', exact: true }).click();
await espera(250);
await shot('ind_btc');
await page.getByRole('button', { name: 'Lightning', exact: true }).click();
await espera(250);
await shot('ind_ln');
await page.mouse.click(5, 5); // tira o foco do chip
await espera(150);
await shot('ind_full', { full: true });
const enviar = page.locator('form button[type="submit"]').first();
await caixa('ind_enviar', enviar);
manifesto.textoEnviar = await enviar.innerText();
await enviar.click();
await page.getByText(/Indicação enviada/).waitFor({ timeout: 15000 });
await espera(600);
await rolar(0);
await shot('ind_ok');
await caixa('ind_ok_msg', page.getByText(/Indicação enviada/));

// ---------------------------------------------------------------- sobre
await abrir('/sobre');
await caixa('sobre_verificamos', page.getByRole('heading', { name: 'Como verificamos' }));
await caixa('sobre_naofaz', page.getByRole('heading', { name: 'O que este site não faz' }));
const itens = page.locator('ul', { hasText: 'Não intermedia' }).locator('li');
const n = await itens.count();
manifesto.itensNaoFaz = n;
for (let i = 0; i < n; i++) await caixa(`sobre_item_${i}`, itens.nth(i));
await rolar(0);
await shot('sobre_full', { full: true });

await writeFile('captura.json', JSON.stringify(manifesto, null, 2));
await browser.close();
console.log(
  'ok:',
  Object.keys(manifesto.shots).length,
  'shots,',
  Object.keys(manifesto.caixas).length,
  'caixas',
);

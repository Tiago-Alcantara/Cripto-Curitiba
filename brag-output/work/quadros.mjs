// node quadros.mjs stills 0.5 2.2 ...   -> stills/t-XX.png
// node quadros.mjs video <saida.mp4>    -> video mudo, 30 fps
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const req = createRequire('/opt/node22/lib/node_modules/playwright/package.json');
const { chromium } = req('playwright');

const FPS = 30;
const DURACAO = 20.5;
const [modo, ...args] = process.argv.slice(2);

const browser = await chromium.launch({
  args: ['--font-render-hinting=none', '--disable-lcd-text'],
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
page.on('pageerror', (e) => console.error('pageerror', e));
page.on('console', (m) => console.log('console', m.text()));
await page.goto(`file://${path.resolve('stage.html')}`);
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(
    [...document.images].map((i) =>
      i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)),
    ),
  );
});
const quadro = async (t) => {
  await page.evaluate((t) => window.render(t), t);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
};

if (modo === 'stills') {
  mkdirSync('stills', { recursive: true });
  const { writeFileSync } = await import('node:fs');
  for (const a of args) {
    const t = Number(a);
    writeFileSync(`stills/t-${t.toFixed(2).padStart(5, '0')}.png`, await quadro(t));
  }
} else if (modo === 'video') {
  const saida = args[0] ?? 'mudo.mp4';
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
      '-i',
      '-',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '15',
      '-pix_fmt',
      'yuv420p',
      '-tune',
      'animation',
      saida,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const total = Math.round(DURACAO * FPS);
  for (let i = 0; i < total; i++) {
    const buf = await quadro(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`quadro ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
}
await browser.close();

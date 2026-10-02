// Gera site.css (Tailwind do proprio site sobre o markup das cenas) e stage.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const web = '/home/user/Cripto-Curitiba/apps/web';

import { realpathSync } from 'node:fs';

const req = createRequire(
  realpathSync(path.join(web, 'node_modules/@tailwindcss/postcss/package.json')),
);
const postcss = req('postcss');
const tailwind = req('@tailwindcss/postcss');

const aqui = path.resolve('.');
const entrada = `@import "${web}/app/globals.css";\n@source "${aqui}/stage.src.html";\n@source "${aqui}/fragments.html";\n@source "${aqui}/anim.js";\n`;
const css = await postcss([tailwind({ base: aqui })]).process(entrada, {
  from: path.join(aqui, 'entrada.css'),
});
writeFileSync('site.css', css.css);

const frag = readFileSync('fragments.json', 'utf8');
const html = readFileSync('stage.src.html', 'utf8').replace('/*FRAGMENTS*/null', frag);
writeFileSync('stage.html', html);
console.log('site.css', css.css.length, 'stage.html', html.length);

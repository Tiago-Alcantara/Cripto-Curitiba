// Compila o Tailwind do proprio site (apps/web/app/globals.css) sobre o markup da composicao.
import { realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '../..');
const web = path.join(raiz, 'apps/web');
const composicao = path.resolve(aqui, '../composition');
const req = createRequire(
  realpathSync(path.join(web, 'node_modules/@tailwindcss/postcss/package.json')),
);
const postcss = req('postcss');
const tailwind = req('@tailwindcss/postcss');

const entrada = `@import "${web}/app/globals.css";\n@source "${composicao}/index.html";\n`;
const css = await postcss([tailwind({ base: composicao })]).process(entrada, {
  from: path.join(composicao, 'entrada.css'),
});
writeFileSync(path.join(composicao, 'assets/site.css'), css.css);
console.log('assets/site.css', css.css.length);

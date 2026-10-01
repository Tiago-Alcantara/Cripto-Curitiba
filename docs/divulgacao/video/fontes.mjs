// Copia as fontes do site (Bodoni Moda, Archivo, JetBrains Mono) que o build do
// Next ja baixou, para o palco do video usar a mesma tipografia sem rede.
// Precisa de `pnpm --filter @cripto/web build` antes.
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const STATIC = process.env.NEXT_STATIC ?? '../../../apps/web/.next/static';
const regras = new Set();

for (const arquivo of await readdir(join(STATIC, 'chunks'))) {
  if (!arquivo.endsWith('.css')) continue;
  const css = await readFile(join(STATIC, 'chunks', arquivo), 'utf8');
  for (const regra of css.match(/@font-face\{[^}]*\}/g) ?? []) {
    if (!regra.includes('Fallback')) regras.add(regra.replaceAll('url(../media/', 'url(media/'));
  }
}
if (regras.size === 0)
  throw new Error(`nenhum @font-face em ${STATIC}/chunks - rode o build do web`);

await mkdir('fontes/media', { recursive: true });
for (const midia of await readdir(join(STATIC, 'media'))) {
  if (midia.endsWith('.woff2'))
    await copyFile(join(STATIC, 'media', midia), join('fontes/media', midia));
}
await writeFile('fontes/fontes.css', [...regras].join('\n'));
console.log(`fontes: ${regras.size} @font-face`);

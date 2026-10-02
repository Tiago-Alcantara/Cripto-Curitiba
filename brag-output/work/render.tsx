import { writeFileSync } from 'node:fs';
import type { Cripto } from '@cripto/shared';
import { renderToStaticMarkup } from 'react-dom/server';
import SiteLayout from '@/app/(site)/layout';
import HomePage from '@/app/(site)/page';
import { EstufaCta } from '@/components/registro/estufa-cta';
import { FichaIndicacao } from '@/components/registro/ficha-indicacao';
import { Selo } from '@/components/registro/ui';
import cryptos from '../../packages/db/prisma/seeds/cryptos.json';

const R = require('react');
const useStateOriginal = R.useState;
let fila: unknown[] = [];
R.useState = (inicial: unknown) =>
  fila.length ? [fila.shift(), () => {}] : useStateOriginal(inicial);

const criptos = cryptos.map((c) => ({ ...c, totalEstabelecimentos: 0 })) as unknown as Cripto[];
const VAZIO = {
  nome: '',
  categoria: '',
  bairro: '',
  contato: '',
  criptos: [] as string[],
  mensagem: '',
  remetenteNome: '',
  remetenteEmail: '',
  website: '',
};
const PREENCHIDO = { ...VAZIO, nome: 'Café das Araucárias', categoria: 'cafe', bairro: 'Batel' };

function ficha(form: typeof VAZIO, enviando = false, enviado = false) {
  // ordem dos useState em FichaIndicacao: tipo, form, enviando, erro, enviado
  fila = ['novo_local', form, enviando, null, enviado];
  const html = renderToStaticMarkup(<FichaIndicacao criptos={criptos} />);
  fila = [];
  return html;
}

async function main() {
  const home = renderToStaticMarkup(await HomePage());
  const layout = renderToStaticMarkup(<SiteLayout>{null}</SiteLayout>);
  const partes: Record<string, string> = {
    layout,
    home,
    seloVerificado: renderToStaticMarkup(
      <Selo status="verificado" confirmadoEm="2026-10-01T15:00:00Z" tamanho="md" />,
    ),
    seloComunidade: renderToStaticMarkup(<Selo status="comunidade" tamanho="md" />),
    seloVencido: renderToStaticMarkup(
      <Selo status="verificado" confirmadoEm="2025-09-12T15:00:00Z" tamanho="md" />,
    ),
    fichaVazia: ficha(VAZIO),
    fichaPreenchida: ficha(PREENCHIDO),
    fichaBtc: ficha({ ...PREENCHIDO, criptos: ['BTC'] }),
    fichaBtcLn: ficha({ ...PREENCHIDO, criptos: ['BTC', 'Lightning'] }),
    fichaEnviando: ficha({ ...PREENCHIDO, criptos: ['BTC', 'Lightning'] }, true),
    fichaRecebida: ficha(PREENCHIDO, false, true),
    estufa: renderToStaticMarkup(<EstufaCta />),
  };
  writeFileSync('fragments.json', JSON.stringify(partes, null, 1));
  writeFileSync(
    'fragments.html',
    Object.entries(partes)
      .map(([k, v]) => `<template id="${k}">${v}</template>`)
      .join('\n'),
  );
  console.log(Object.fromEntries(Object.entries(partes).map(([k, v]) => [k, v.length])));
}
main();

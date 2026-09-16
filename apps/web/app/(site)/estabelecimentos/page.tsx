import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EstablishmentsExplorer } from '@/components/establishments-explorer';
import { listarBairros, listarCriptomoedas, listarEstabelecimentos } from '@/lib/api';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Onde gastar cripto em Curitiba',
  description:
    'Lista completa de estabelecimentos de Curitiba que aceitam criptomoedas, com filtro por cripto, forma de pagamento, categoria e bairro.',
};

export default async function EstabelecimentosPage() {
  const [lista, bairros, criptos] = await Promise.all([
    listarEstabelecimentos({ perPage: '100' }),
    listarBairros(),
    listarCriptomoedas(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">Onde gastar cripto em Curitiba</h1>
        <p className="mt-2 text-muted">
          Filtre por moeda, forma de pagamento, categoria ou bairro. Cada card mostra quando a
          informação foi confirmada pela última vez.
        </p>
      </header>

      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <EstablishmentsExplorer estabelecimentos={lista.data} bairros={bairros} criptos={criptos} />
      </Suspense>
    </div>
  );
}

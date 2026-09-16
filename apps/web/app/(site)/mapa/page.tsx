import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiOffline } from '@/components/api-offline';
import { MapExplorer } from '@/components/map-explorer';
import { listarCriptomoedas, listarEstabelecimentos, tolerante } from '@/lib/api';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mapa dos lugares que aceitam cripto em Curitiba',
  description:
    'Mapa de Curitiba com restaurantes, cafés, bares e lojas que aceitam criptomoedas, com selo de verificação e as moedas aceitas em cada ponto.',
  alternates: { canonical: '/mapa' },
};

export default async function MapaPage() {
  const [lista, criptos] = await Promise.all([
    tolerante(listarEstabelecimentos({ perPage: '100' }), null),
    tolerante(listarCriptomoedas(), null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl">Mapa</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Todos os lugares mapeados em Curitiba. Pin verde é verificado pela equipe; âmbar veio da
          comunidade e ainda não foi confirmado.{' '}
          <Link href="/estabelecimentos" className="text-primary hover:underline">
            Prefere a lista?
          </Link>
        </p>
      </header>

      {lista && criptos ? (
        <MapExplorer estabelecimentos={lista.data} criptos={criptos} />
      ) : (
        <ApiOffline />
      )}
    </div>
  );
}

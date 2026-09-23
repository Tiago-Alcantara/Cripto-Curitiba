import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApiOffline } from '@/components/api-offline';
import { MapaRegistro } from '@/components/registro/mapa-registro';
import { AberturaPagina } from '@/components/registro/ui';
import { listarCriptomoedas, listarEstabelecimentos, tolerante } from '@/lib/api';
import { numerarFichas } from '@/lib/registro';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mapa dos lugares que aceitam cripto em Curitiba',
  description:
    'Registro de restaurantes, cafés, bares e lojas de Curitiba que aceitam criptomoedas, com selo de verificação, data de confirmação e as moedas aceitas em cada ponto.',
  alternates: { canonical: '/mapa' },
};

export default async function MapaPage() {
  const [lista, criptos] = await Promise.all([
    tolerante(listarEstabelecimentos({ perPage: '100' }), null),
    tolerante(listarCriptomoedas(), null),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1140px] animate-entrada px-7 pt-11 pb-[72px]">
      {lista && criptos ? (
        <Suspense fallback={<AberturaPagina rotulo="Registro geral · Curitiba" titulo="O mapa" />}>
          <MapaRegistro
            estabelecimentos={lista.data}
            criptos={criptos}
            numeros={Object.fromEntries(numerarFichas(lista.data, lista.meta.total))}
          />
        </Suspense>
      ) : (
        <>
          <AberturaPagina rotulo="Registro geral · Curitiba" titulo="O mapa" />
          <div className="mt-8">
            <ApiOffline />
          </div>
        </>
      )}
    </div>
  );
}

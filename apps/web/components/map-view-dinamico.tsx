'use client';

import type { EstabelecimentoResumo } from '@cripto/shared';
import dynamic from 'next/dynamic';

/** Leaflet toca `window` na importacao: so pode carregar no cliente. */
const MapView = dynamic(() => import('./map-view').then((modulo) => modulo.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[0.92/1] min-h-[420px] w-full items-center justify-center rounded-[150px_150px_3px_3px] border-[3px] border-pinheiro bg-pinheiro font-mono text-[#b9c4bd] text-[10px] uppercase tracking-[0.14em]">
      Carregando mapa…
    </div>
  ),
});

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  tamanho?: string;
  selecionadoId?: string | null;
  aoSelecionar?: (id: string | null) => void;
  enquadrarNosPins?: boolean;
};

export function MapViewDinamico(props: Props) {
  return <MapView {...props} />;
}

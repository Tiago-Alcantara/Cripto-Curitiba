'use client';

import type { EstabelecimentoResumo } from '@cripto/shared';
import dynamic from 'next/dynamic';

/** Leaflet toca `window` na importacao: so pode carregar no cliente. */
const MapView = dynamic(() => import('./map-view').then((modulo) => modulo.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center rounded-card border border-border bg-surface text-muted text-sm">
      Carregando mapa…
    </div>
  ),
});

export function MapViewDinamico({
  estabelecimentos,
}: {
  estabelecimentos: EstabelecimentoResumo[];
}) {
  return <MapView estabelecimentos={estabelecimentos} />;
}

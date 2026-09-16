'use client';

import type { EstabelecimentoResumo } from '@cripto/shared';
import { rotulos } from '@cripto/shared';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

const CENTRO_DE_CURITIBA: [number, number] = [-25.4284, -49.2733];

/**
 * Pin desenhado em SVG para nao depender das imagens padrao do Leaflet, que
 * quebram em bundler (o caminho das imagens e resolvido em runtime).
 */
function criarIcone(verificado: boolean) {
  const cor = verificado ? '#0e5c43' : '#b4751a';

  return L.divIcon({
    className: 'cripto-pin',
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.6 20.2 12.1 20.7a1.3 1.3 0 0 0 1.8 0C14.4 33.2 26 22.2 26 13 26 5.82 20.18 0 13 0Z" fill="${cor}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

const iconeVerificado = criarIcone(true);
const iconeComunidade = criarIcone(false);

export function MapView({ estabelecimentos }: { estabelecimentos: EstabelecimentoResumo[] }) {
  const comCoordenada = estabelecimentos.filter(
    (e): e is EstabelecimentoResumo & { latitude: number; longitude: number } =>
      e.latitude !== null && e.longitude !== null,
  );

  const semCoordenada = estabelecimentos.length - comCoordenada.length;

  return (
    <div className="space-y-3">
      <div className="h-[480px] overflow-hidden rounded-card border border-border">
        <MapContainer
          center={CENTRO_DE_CURITIBA}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {/* CARTO Positron: basemap claro e sem ruido, gratuito com atribuicao (ADR-0005). */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />

          <MarkerClusterGroup chunkedLoading maxClusterRadius={45}>
            {comCoordenada.map((estabelecimento) => (
              <Marker
                key={estabelecimento.id}
                position={[estabelecimento.latitude, estabelecimento.longitude]}
                icon={
                  estabelecimento.verificacao.status === 'verificado'
                    ? iconeVerificado
                    : iconeComunidade
                }
              >
                <Popup>
                  <strong className="block text-sm">{estabelecimento.nome}</strong>
                  <span className="text-xs">
                    {rotulos.categoria[estabelecimento.categoria as keyof typeof rotulos.categoria]}{' '}
                    · {estabelecimento.bairro}
                  </span>
                  <span className="mt-1 block text-xs">
                    {[...new Set(estabelecimento.pagamentos.map((p) => p.cripto))].join(', ') ||
                      'sem forma de pagamento registrada'}
                  </span>
                  <Link
                    href={`/estabelecimentos/${estabelecimento.slug}`}
                    className="mt-2 inline-block text-xs underline"
                  >
                    Ver detalhes
                  </Link>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {semCoordenada > 0 ? (
        <p className="text-muted text-xs">
          {semCoordenada}{' '}
          {semCoordenada === 1
            ? 'lugar ainda sem coordenada não aparece no mapa'
            : 'lugares ainda sem coordenada não aparecem no mapa'}{' '}
          — todos continuam na lista.
        </p>
      ) : null}
    </div>
  );
}

'use client';

import type { EstabelecimentoResumo } from '@cripto/shared';
import { rotulos } from '@cripto/shared';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

const CENTRO_DE_CURITIBA: [number, number] = [-25.4284, -49.2733];

export type ComCoordenada = EstabelecimentoResumo & { latitude: number; longitude: number };

export function temCoordenada(e: EstabelecimentoResumo): e is ComCoordenada {
  return e.latitude !== null && e.longitude !== null;
}

/**
 * Pin desenhado em SVG para nao depender das imagens padrao do Leaflet, que
 * quebram em bundler (o caminho das imagens e resolvido em runtime).
 */
function criarIcone(verificado: boolean, destacado = false) {
  const cor = verificado ? '#0e5c43' : '#b4751a';
  const escala = destacado ? 1.35 : 1;
  const largura = Math.round(26 * escala);
  const altura = Math.round(34 * escala);

  return L.divIcon({
    className: 'cripto-pin',
    html: `<svg width="${largura}" height="${altura}" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.6 20.2 12.1 20.7a1.3 1.3 0 0 0 1.8 0C14.4 33.2 26 22.2 26 13 26 5.82 20.18 0 13 0Z" fill="${cor}"${
        destacado ? ' stroke="#1a1a18" stroke-width="1.5"' : ''
      }/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [largura, altura],
    iconAnchor: [Math.round(largura / 2), altura],
    popupAnchor: [0, -altura + 4],
  });
}

const icones = {
  verificado: criarIcone(true),
  comunidade: criarIcone(false),
  verificadoDestacado: criarIcone(true, true),
  comunidadeDestacado: criarIcone(false, true),
};

function iconeDe(estabelecimento: ComCoordenada, destacado: boolean) {
  const verificado = estabelecimento.verificacao.status === 'verificado';

  if (destacado) return verificado ? icones.verificadoDestacado : icones.comunidadeDestacado;
  return verificado ? icones.verificado : icones.comunidade;
}

/** Enquadra o mapa nos pins existentes; sem pins, fica no centro da cidade. */
function Enquadrar({ pontos }: { pontos: ComCoordenada[] }) {
  const map = useMap();

  useEffect(() => {
    if (pontos.length === 0) return;

    if (pontos.length === 1) {
      const unico = pontos[0] as ComCoordenada;
      map.setView([unico.latitude, unico.longitude], 16);
      return;
    }

    map.fitBounds(
      L.latLngBounds(pontos.map((p) => [p.latitude, p.longitude] as [number, number])),
      { padding: [48, 48], maxZoom: 16 },
    );
  }, [map, pontos]);

  return null;
}

/** Leva o mapa ate o item escolhido na lista lateral. */
function Focar({ alvo }: { alvo: ComCoordenada | null }) {
  const map = useMap();

  useEffect(() => {
    if (!alvo) return;
    map.flyTo([alvo.latitude, alvo.longitude], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [map, alvo]);

  return null;
}

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  /** Classe de altura do mapa; a pagina dedicada usa uma bem maior. */
  altura?: string;
  selecionadoId?: string | null;
  aoSelecionar?: (id: string | null) => void;
  enquadrarNosPins?: boolean;
};

export function MapView({
  estabelecimentos,
  altura = 'h-[480px]',
  selecionadoId = null,
  aoSelecionar,
  enquadrarNosPins = false,
}: Props) {
  const comCoordenada = estabelecimentos.filter(temCoordenada);
  const semCoordenada = estabelecimentos.length - comCoordenada.length;
  const selecionado = comCoordenada.find((e) => e.id === selecionadoId) ?? null;

  return (
    <div className="space-y-3">
      <div className={`${altura} overflow-hidden rounded-card border border-border`}>
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

          {enquadrarNosPins ? <Enquadrar pontos={comCoordenada} /> : null}
          <Focar alvo={selecionado} />

          <MarkerClusterGroup chunkedLoading maxClusterRadius={45}>
            {comCoordenada.map((estabelecimento) => (
              <Marker
                key={estabelecimento.id}
                position={[estabelecimento.latitude, estabelecimento.longitude]}
                icon={iconeDe(estabelecimento, estabelecimento.id === selecionadoId)}
                eventHandlers={
                  aoSelecionar ? { click: () => aoSelecionar(estabelecimento.id) } : undefined
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

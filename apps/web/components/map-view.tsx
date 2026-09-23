'use client';

import type { EstabelecimentoResumo } from '@cripto/shared';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { rotuloCategoria } from '@/lib/registro';

const CENTRO_DE_CURITIBA: [number, number] = [-25.4284, -49.2733];

export type ComCoordenada = EstabelecimentoResumo & { latitude: number; longitude: number };

export function temCoordenada(e: EstabelecimentoResumo): e is ComCoordenada {
  return e.latitude !== null && e.longitude !== null;
}

/**
 * "O pinhao e o nosso pin": semente girada 45deg (border-radius 50% 50% 50% 0).
 * Cal com contorno verde se verificado, ocre se veio da comunidade; 13px
 * normal, 21px selecionado (docs/05-design.md). Desenhado em HTML para nao
 * depender das imagens padrao do Leaflet, que quebram em bundler.
 */
function criarIcone(verificado: boolean, destacado: boolean) {
  const lado = destacado ? 21 : 13;
  const caixa = lado + 12;
  const cor = verificado ? '#efe9dd' : '#c9902c';

  return L.divIcon({
    className: 'pin-pinhao',
    html: `<span style="position:absolute;left:50%;top:50%;width:${lado}px;height:${lado}px;border-radius:50% 50% 50% 0;background:${cor};border:1.5px solid #0a4a36;transform:translate(-50%,-50%) rotate(45deg);"></span>`,
    iconSize: [caixa, caixa],
    iconAnchor: [caixa / 2, caixa / 2],
    popupAnchor: [0, -lado],
  });
}

const icones = {
  verificado: criarIcone(true, false),
  comunidade: criarIcone(false, false),
  verificadoDestacado: criarIcone(true, true),
  comunidadeDestacado: criarIcone(false, true),
};

function iconeDe(estabelecimento: ComCoordenada, destacado: boolean) {
  const verificado = estabelecimento.verificacao.status === 'verificado';

  if (destacado) return verificado ? icones.verificadoDestacado : icones.comunidadeDestacado;
  return verificado ? icones.verificado : icones.comunidade;
}

// Tipo estrutural: @types/leaflet nao traz o MarkerCluster do plugin.
function iconeDeGrupo(grupo: { getChildCount: () => number }) {
  return L.divIcon({
    html: `<span>${grupo.getChildCount()}</span>`,
    className: 'marker-cluster-registro',
    iconSize: L.point(30, 30),
  });
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
      { padding: [56, 56], maxZoom: 16 },
    );
  }, [map, pontos]);

  return null;
}

/** Leva o mapa ate o item escolhido na lista lateral. */
function Focar({ alvo }: { alvo: ComCoordenada | null }) {
  const map = useMap();

  useEffect(() => {
    if (!alvo) return;
    map.flyTo([alvo.latitude, alvo.longitude], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [map, alvo]);

  return null;
}

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  /** Classes de tamanho do campo do mapa. */
  tamanho?: string;
  selecionadoId?: string | null;
  aoSelecionar?: (id: string | null) => void;
  enquadrarNosPins?: boolean;
};

/**
 * Campo do mapa em verde-pinheiro com topo em arco (150px 150px 3px 3px). O
 * zoom fica embaixo porque o arco corta o canto superior.
 */
export function MapView({
  estabelecimentos,
  tamanho = 'aspect-[0.92/1] min-h-[420px]',
  selecionadoId = null,
  aoSelecionar,
  enquadrarNosPins = false,
}: Props) {
  const comCoordenada = estabelecimentos.filter(temCoordenada);
  const selecionado = comCoordenada.find((e) => e.id === selecionadoId) ?? null;

  return (
    <div
      className={`mapa-registro relative isolate w-full overflow-hidden rounded-[150px_150px_3px_3px] border-[3px] border-pinheiro bg-pinheiro ${tamanho}`}
    >
      <MapContainer
        center={CENTRO_DE_CURITIBA}
        zoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <ZoomControl position="bottomleft" />
        {/*
          Tiles padrao do OpenStreetMap: sem cadastro, sem chave (ADR-0005).
          O filtro em globals.css aquece os tiles para casar com o papel.
        */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {enquadrarNosPins ? <Enquadrar pontos={comCoordenada} /> : null}
        <Focar alvo={selecionado} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          iconCreateFunction={iconeDeGrupo}
          showCoverageOnHover={false}
        >
          {comCoordenada.map((estabelecimento) => (
            <Marker
              key={estabelecimento.id}
              position={[estabelecimento.latitude, estabelecimento.longitude]}
              icon={iconeDe(estabelecimento, estabelecimento.id === selecionadoId)}
              zIndexOffset={estabelecimento.id === selecionadoId ? 1000 : 0}
              title={estabelecimento.nome}
              eventHandlers={
                aoSelecionar ? { click: () => aoSelecionar(estabelecimento.id) } : undefined
              }
            >
              <Popup closeButton={false}>
                <strong className="mb-0.5 block font-display font-medium text-[15px]">
                  {estabelecimento.nome}
                </strong>
                <span className="block font-mono text-[9.5px] text-tinta-fraca uppercase tracking-[0.1em]">
                  {rotuloCategoria(estabelecimento.categoria)} · {estabelecimento.bairro}
                </span>
                <Link
                  href={`/estabelecimentos/${estabelecimento.slug}`}
                  className="mt-1.5 inline-block font-bold text-[10.5px] text-verde uppercase tracking-[0.1em]"
                >
                  Ver ficha →
                </Link>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

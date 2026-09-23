'use client';

import type { Cripto, EstabelecimentoResumo } from '@cripto/shared';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapViewDinamico } from '@/components/map-view-dinamico';
import { confirmacaoMaisRecente } from '@/lib/formatters';
import { normalizar, rotuloCategoria, rotulosCripto } from '@/lib/registro';
import { AberturaPagina, botaoPrimario, FotoPlaceholder, Selo, TagCripto } from './ui';

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  criptos: Cripto[];
  numeros: Record<string, string>;
};

/** Lightning e metodo, nao moeda, mas e como a gente procura: vira um chip de Moeda. */
const LIGHTNING = 'lightning';

type Filtros = {
  q: string;
  categoria: string | null;
  cripto: string | null;
  metodo: string | null;
  verificacao: string | null;
};

function lerFiltros(parametros: URLSearchParams): Filtros {
  return {
    q: parametros.get('q') ?? '',
    categoria: parametros.get('categoria'),
    cripto: parametros.get('cripto'),
    metodo: parametros.get('metodo'),
    verificacao: parametros.get('verificacao'),
  };
}

function escreverFiltros(filtros: Filtros): string {
  const parametros = new URLSearchParams();
  if (filtros.q) parametros.set('q', filtros.q);
  if (filtros.categoria) parametros.set('categoria', filtros.categoria);
  if (filtros.cripto) parametros.set('cripto', filtros.cripto);
  if (filtros.metodo) parametros.set('metodo', filtros.metodo);
  if (filtros.verificacao) parametros.set('verificacao', filtros.verificacao);
  return parametros.toString();
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`cursor-pointer rounded-[2px] border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] ${
        ativo
          ? 'border-verde bg-verde font-bold text-creme'
          : 'border-regua bg-transparent font-semibold text-tinta-media hover:border-tinta hover:text-tinta'
      }`}
    >
      {children}
    </button>
  );
}

function GrupoChips({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-[7px] border-0 p-0">
      <legend className="float-left mr-[7px] w-16 font-bold font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Registro geral: lista de fichas + mapa real, sincronizados por `selecionadoId`.
 * O filtro roda no cliente (o MVP cabe em memoria e a lista ja veio do ISR); o
 * estado mora na URL para que um filtro seja compartilhavel.
 */
export function MapaRegistro({ estabelecimentos, criptos, numeros }: Props) {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const filtros = useMemo(() => lerFiltros(parametros), [parametros]);
  const [busca, setBusca] = useState(filtros.q);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const aplicar = useCallback(
    (novos: Partial<Filtros>) => {
      const query = escreverFiltros({ ...filtros, ...novos });
      router.replace(query ? `${caminho}?${query}` : caminho, { scroll: false });
    },
    [filtros, caminho, router],
  );

  // A busca escreve na URL com um pequeno atraso para nao reescrever a cada tecla.
  useEffect(() => {
    if (busca === filtros.q) return;
    const espera = setTimeout(() => aplicar({ q: busca.trim() }), 250);
    return () => clearTimeout(espera);
  }, [busca, filtros.q, aplicar]);

  const categorias = useMemo(
    () => [...new Set(estabelecimentos.map((e) => e.categoria))].sort(),
    [estabelecimentos],
  );

  const moedas = useMemo(
    () => criptos.filter((c) => c.totalEstabelecimentos > 0).map((c) => c.symbol),
    [criptos],
  );

  const temLightning = useMemo(
    () => estabelecimentos.some((e) => e.pagamentos.some((p) => p.metodo === LIGHTNING)),
    [estabelecimentos],
  );

  const filtrados = useMemo(() => {
    const termo = normalizar(filtros.q.trim());

    return estabelecimentos.filter((estabelecimento) => {
      if (termo && !normalizar(`${estabelecimento.nome} ${estabelecimento.bairro}`).includes(termo))
        return false;
      if (filtros.categoria && estabelecimento.categoria !== filtros.categoria) return false;
      if (filtros.verificacao && estabelecimento.verificacao.status !== filtros.verificacao)
        return false;
      if (filtros.cripto && !estabelecimento.pagamentos.some((p) => p.cripto === filtros.cripto))
        return false;
      if (filtros.metodo && !estabelecimento.pagamentos.some((p) => p.metodo === filtros.metodo))
        return false;
      return true;
    });
  }, [estabelecimentos, filtros]);

  const selecionado = filtrados.find((e) => e.id === selecionadoId) ?? filtrados[0] ?? null;
  const semCoordenada = filtrados.filter((e) => e.latitude === null || e.longitude === null).length;
  const moedaAtiva = filtros.metodo === LIGHTNING ? LIGHTNING : filtros.cripto;

  return (
    <>
      <AberturaPagina
        rotulo="Registro geral · Curitiba"
        titulo="O mapa"
        lateral={
          <span
            className="font-mono text-[11px] text-tinta-media uppercase tracking-[0.12em]"
            aria-live="polite"
          >
            {filtrados.length} {filtrados.length === 1 ? 'local listado' : 'locais listados'}
          </span>
        }
      />

      <div className="mt-[26px] mb-7 flex flex-col gap-3.5">
        <label className="max-w-[400px]">
          <span className="sr-only">Buscar por nome ou bairro</span>
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome ou bairro"
            className="w-full border-0 border-tinta border-b-[1.5px] bg-transparent px-0.5 py-[11px] text-[15px] text-tinta outline-none placeholder:text-tinta-fraca focus:border-verde focus-visible:outline-none"
          />
        </label>

        <GrupoChips titulo="Ramo">
          <Chip ativo={!filtros.categoria} onClick={() => aplicar({ categoria: null })}>
            Todos
          </Chip>
          {categorias.map((categoria) => (
            <Chip
              key={categoria}
              ativo={filtros.categoria === categoria}
              onClick={() => aplicar({ categoria })}
            >
              {rotuloCategoria(categoria)}
            </Chip>
          ))}
        </GrupoChips>

        <GrupoChips titulo="Moeda">
          <Chip ativo={!moedaAtiva} onClick={() => aplicar({ cripto: null, metodo: null })}>
            Todos
          </Chip>
          {moedas.map((simbolo) => (
            <Chip
              key={simbolo}
              ativo={moedaAtiva === simbolo}
              onClick={() => aplicar({ cripto: simbolo, metodo: null })}
            >
              {simbolo}
            </Chip>
          ))}
          {temLightning ? (
            <Chip
              ativo={moedaAtiva === LIGHTNING}
              onClick={() => aplicar({ cripto: null, metodo: LIGHTNING })}
            >
              Lightning
            </Chip>
          ) : null}
          <label className="ml-2.5 flex cursor-pointer items-center gap-[7px] font-semibold text-[12px] text-tinta-media uppercase tracking-[0.06em]">
            <input
              type="checkbox"
              checked={filtros.verificacao === 'verificado'}
              onChange={(evento) =>
                aplicar({ verificacao: evento.target.checked ? 'verificado' : null })
              }
              className="h-[15px] w-[15px] accent-verde"
            />
            Só verificados
          </label>
        </GrupoChips>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(310px,1fr))] items-start gap-7">
        <ul className="m-0 flex max-h-[660px] list-none flex-col overflow-auto border-tinta border-t p-0">
          {filtrados.length === 0 ? (
            <li className="border-regua border-b px-[18px] py-[34px] text-center">
              <p className="mt-0 mb-2 font-display font-medium text-[21px]">
                Nenhum lugar com esses filtros.
              </p>
              <p className="mt-0 mb-[18px] text-[14px] text-tinta-media">
                Conhece um lugar assim em Curitiba?
              </p>
              <Link href="/indicar" className={botaoPrimario}>
                Indicar local
              </Link>
            </li>
          ) : null}

          {filtrados.map((estabelecimento) => {
            const ativo = estabelecimento.id === selecionado?.id;
            const verificado = estabelecimento.verificacao.status === 'verificado';
            const numero = numeros[estabelecimento.id];

            return (
              <li key={estabelecimento.id}>
                <button
                  type="button"
                  onClick={() => setSelecionadoId(estabelecimento.id)}
                  aria-current={ativo ? 'true' : undefined}
                  className={`flex w-full cursor-pointer items-start gap-3.5 border-0 border-regua border-b border-l-4 border-solid px-4 py-3.5 text-left text-tinta ${
                    ativo
                      ? 'border-l-verde bg-papel-claro'
                      : 'bg-transparent hover:bg-papel-claro/60'
                  } ${!ativo && verificado ? 'border-l-regua' : ''} ${
                    !ativo && !verificado ? 'border-l-ocre' : ''
                  }`}
                >
                  {estabelecimento.fotoCapa ? (
                    <span className="relative h-[62px] w-[62px] shrink-0 border border-regua">
                      <Image
                        src={estabelecimento.fotoCapa}
                        alt=""
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <FotoPlaceholder
                      rotulo="foto"
                      className="h-[62px] w-[62px] shrink-0 border border-regua [&>span]:text-[8.5px]"
                    />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex flex-wrap gap-2 font-mono text-[9.5px] text-tinta-fraca uppercase tracking-[0.14em]">
                      {numero ? <span>№ {numero}</span> : null}
                      <span>
                        {rotuloCategoria(estabelecimento.categoria)} · {estabelecimento.bairro}
                      </span>
                    </span>
                    <span className="font-display font-medium text-[19px] leading-[1.15]">
                      {estabelecimento.nome}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Selo
                        status={estabelecimento.verificacao.status}
                        confirmadoEm={
                          confirmacaoMaisRecente(estabelecimento.pagamentos) ??
                          estabelecimento.verificacao.em
                        }
                      />
                      {rotulosCripto(estabelecimento.pagamentos).map((rotulo) => (
                        <TagCripto key={rotulo}>{rotulo}</TagCripto>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div>
          <MapViewDinamico
            estabelecimentos={filtrados}
            // So o que a pessoa escolheu leva o mapa ate o pin; ao abrir, enquadra todos.
            selecionadoId={selecionadoId}
            aoSelecionar={setSelecionadoId}
            enquadrarNosPins
          />

          <div className="mt-3.5 flex flex-wrap gap-[18px] font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.1em]">
            <span className="inline-flex items-center gap-2">
              <span className="pinhao inline-block h-2.5 w-2.5 border-[1.5px] border-verde-escuro bg-papel" />
              Verificado
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="pinhao inline-block h-2.5 w-2.5 bg-ocre" />
              Reportado pela comunidade
            </span>
          </div>
          {semCoordenada > 0 ? (
            <p className="mt-2.5 mb-0 font-mono text-[9.5px] text-tinta-fraca leading-[1.5]">
              {semCoordenada === 1
                ? '1 local ainda sem coordenada não aparece no mapa'
                : `${semCoordenada} locais ainda sem coordenada não aparecem no mapa`}{' '}
              — todos continuam na lista.
            </p>
          ) : null}

          {selecionado ? (
            <section
              aria-label="Local selecionado"
              className="mt-5 rounded-[2px] border border-tinta bg-papel-claro px-5 py-4"
            >
              <div className="font-mono text-[9.5px] text-tinta-fraca uppercase tracking-[0.14em]">
                {numeros[selecionado.id] ? `№ ${numeros[selecionado.id]} · ` : ''}
                {rotuloCategoria(selecionado.categoria)} · {selecionado.bairro}
              </div>
              <h2 className="mt-1.5 mb-2.5 font-display font-medium text-[23px] leading-[1.15]">
                {selecionado.nome}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Selo
                  status={selecionado.verificacao.status}
                  confirmadoEm={
                    confirmacaoMaisRecente(selecionado.pagamentos) ?? selecionado.verificacao.em
                  }
                  tamanho="md"
                />
                {rotulosCripto(selecionado.pagamentos).map((rotulo) => (
                  <TagCripto key={rotulo}>{rotulo}</TagCripto>
                ))}
              </div>
              <Link
                href={`/estabelecimentos/${selecionado.slug}`}
                className="mt-3.5 inline-block font-bold text-[11.5px] text-verde uppercase tracking-[0.11em] hover:text-verde-escuro"
              >
                Ver ficha completa →
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}

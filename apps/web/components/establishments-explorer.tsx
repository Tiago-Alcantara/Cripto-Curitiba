'use client';

import type { Bairro, Cripto, EstabelecimentoResumo } from '@cripto/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { EstablishmentCard } from '@/components/establishment-card';
import { FILTROS_VAZIOS, FilterBar, type Filtros } from '@/components/filter-bar';
import { MapViewDinamico } from '@/components/map-view-dinamico';

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  bairros: Bairro[];
  criptos: Cripto[];
};

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function lerFiltros(parametros: URLSearchParams): Filtros {
  return {
    q: parametros.get('q') ?? '',
    bairro: parametros.getAll('bairro'),
    categoria: parametros.getAll('categoria'),
    cripto: parametros.getAll('cripto'),
    metodo: parametros.getAll('metodo'),
    verificacao: parametros.get('verificacao'),
  };
}

function escreverFiltros(filtros: Filtros): string {
  const parametros = new URLSearchParams();

  if (filtros.q) parametros.set('q', filtros.q);
  for (const valor of filtros.bairro) parametros.append('bairro', valor);
  for (const valor of filtros.categoria) parametros.append('categoria', valor);
  for (const valor of filtros.cripto) parametros.append('cripto', valor);
  for (const valor of filtros.metodo) parametros.append('metodo', valor);
  if (filtros.verificacao) parametros.set('verificacao', filtros.verificacao);

  return parametros.toString();
}

/**
 * O filtro roda no cliente: o MVP inteiro cabe em memoria e a lista ja veio
 * cacheada pelo ISR, entao filtrar sem ida ao servidor e instantaneo. O estado
 * mora na URL para que um filtro seja compartilhavel (docs/02-arquitetura.md).
 */
export function EstablishmentsExplorer({ estabelecimentos, bairros, criptos }: Props) {
  const router = useRouter();
  const parametros = useSearchParams();
  const filtros = useMemo(() => lerFiltros(parametros), [parametros]);

  const aoMudar = useCallback(
    (novos: Filtros) => {
      const query = escreverFiltros(novos);
      router.replace(query ? `/estabelecimentos?${query}` : '/estabelecimentos', { scroll: false });
    },
    [router],
  );

  const categorias = useMemo(
    () => [...new Set(estabelecimentos.map((e) => e.categoria))].sort(),
    [estabelecimentos],
  );

  const metodos = useMemo(
    () => [...new Set(estabelecimentos.flatMap((e) => e.pagamentos.map((p) => p.metodo)))].sort(),
    [estabelecimentos],
  );

  const filtrados = useMemo(() => {
    const busca = normalizar(filtros.q.trim());

    return estabelecimentos.filter((estabelecimento) => {
      if (busca) {
        const alvo = normalizar(`${estabelecimento.nome} ${estabelecimento.bairro}`);
        if (!alvo.includes(busca)) return false;
      }

      if (filtros.bairro.length > 0 && !filtros.bairro.includes(estabelecimento.bairro)) {
        return false;
      }

      if (filtros.categoria.length > 0 && !filtros.categoria.includes(estabelecimento.categoria)) {
        return false;
      }

      if (filtros.verificacao && estabelecimento.verificacao.status !== filtros.verificacao) {
        return false;
      }

      // Cripto e metodo precisam casar no MESMO pagamento, igual a API faz.
      if (filtros.cripto.length > 0 || filtros.metodo.length > 0) {
        const casa = estabelecimento.pagamentos.some((pagamento) => {
          const criptoOk = filtros.cripto.length === 0 || filtros.cripto.includes(pagamento.cripto);
          const metodoOk = filtros.metodo.length === 0 || filtros.metodo.includes(pagamento.metodo);
          return criptoOk && metodoOk;
        });

        if (!casa) return false;
      }

      return true;
    });
  }, [estabelecimentos, filtros]);

  const [visao, setVisao] = useState<'lista' | 'mapa'>('lista');

  return (
    <div className="space-y-6">
      <FilterBar
        filtros={filtros}
        bairros={bairros}
        criptos={criptos}
        categorias={categorias}
        metodos={metodos}
        aoMudar={aoMudar}
        total={filtrados.length}
      />

      <div className="flex items-center justify-between gap-4">
        <fieldset
          className="inline-flex rounded-control border border-border bg-surface p-0.5"
          aria-label="Forma de visualizar"
        >
          {(['lista', 'mapa'] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setVisao(opcao)}
              aria-pressed={visao === opcao}
              className={`rounded-[6px] px-3 py-1.5 text-sm capitalize transition-colors ${
                visao === opcao ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
              }`}
            >
              {opcao}
            </button>
          ))}
        </fieldset>
      </div>

      {visao === 'mapa' && filtrados.length > 0 ? (
        <MapViewDinamico estabelecimentos={filtrados} />
      ) : null}

      {filtrados.length === 0 ? (
        <EmptyState
          titulo="Nenhum lugar com esses filtros"
          descricao="Tente afrouxar os filtros. Se você conhece um lugar que deveria estar aqui, conta pra gente."
          acao={{ href: '/sugerir', texto: 'Sugerir um lugar' }}
        />
      ) : visao === 'lista' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((estabelecimento) => (
            <EstablishmentCard key={estabelecimento.id} estabelecimento={estabelecimento} />
          ))}
        </div>
      ) : null}

      {filtros !== FILTROS_VAZIOS && filtrados.length > 0 ? (
        <p className="text-center text-muted text-sm">
          Não achou o que procurava?{' '}
          <a href="/sugerir" className="text-primary hover:underline">
            Sugira um lugar novo
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}

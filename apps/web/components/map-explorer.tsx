'use client';

import type { Cripto, EstabelecimentoResumo } from '@cripto/shared';
import { rotulos } from '@cripto/shared';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MapViewDinamico } from '@/components/map-view-dinamico';
import { VerificationBadge } from '@/components/verification-badge';
import { confirmacaoMaisRecente } from '@/lib/formatters';

type Props = {
  estabelecimentos: EstabelecimentoResumo[];
  criptos: Cripto[];
};

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Mapa em tela cheia com a lista ao lado, sincronizados: clicar num item leva
 * o mapa ate o pin, clicar no pin destaca o item.
 */
export function MapExplorer({ estabelecimentos, criptos }: Props) {
  const [busca, setBusca] = useState('');
  const [criptosEscolhidas, setCriptosEscolhidas] = useState<string[]>([]);
  const [soVerificados, setSoVerificados] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());

    return estabelecimentos.filter((estabelecimento) => {
      if (termo) {
        const alvo = normalizar(`${estabelecimento.nome} ${estabelecimento.bairro}`);
        if (!alvo.includes(termo)) return false;
      }

      if (soVerificados && estabelecimento.verificacao.status !== 'verificado') return false;

      if (criptosEscolhidas.length > 0) {
        const aceita = estabelecimento.pagamentos.some((pagamento) =>
          criptosEscolhidas.includes(pagamento.cripto),
        );
        if (!aceita) return false;
      }

      return true;
    });
  }, [estabelecimentos, busca, criptosEscolhidas, soVerificados]);

  const noMapa = filtrados.filter((e) => e.latitude !== null && e.longitude !== null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="min-w-[220px] flex-1">
          <span className="sr-only">Buscar por nome ou bairro</span>
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome ou bairro"
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted"
          />
        </label>

        {criptos
          .filter((cripto) => cripto.totalEstabelecimentos > 0)
          .map((cripto) => {
            const ativo = criptosEscolhidas.includes(cripto.symbol);

            return (
              <button
                key={cripto.symbol}
                type="button"
                aria-pressed={ativo}
                onClick={() =>
                  setCriptosEscolhidas((atual) =>
                    ativo ? atual.filter((s) => s !== cripto.symbol) : [...atual, cripto.symbol],
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  ativo
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-muted hover:text-foreground'
                }`}
              >
                {cripto.symbol}
              </button>
            );
          })}

        <button
          type="button"
          aria-pressed={soVerificados}
          onClick={() => setSoVerificados((atual) => !atual)}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            soVerificados
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-muted hover:text-foreground'
          }`}
        >
          Só verificados
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <MapViewDinamico
          estabelecimentos={filtrados}
          altura="h-[60vh] min-h-[420px] lg:h-[calc(100vh-18rem)]"
          selecionadoId={selecionadoId}
          aoSelecionar={setSelecionadoId}
          enquadrarNosPins
        />

        <aside className="lg:h-[calc(100vh-18rem)] lg:overflow-y-auto">
          <p className="mb-2 text-muted text-sm" aria-live="polite">
            {noMapa.length} {noMapa.length === 1 ? 'lugar no mapa' : 'lugares no mapa'}
          </p>

          {noMapa.length === 0 ? (
            <p className="rounded-card border border-border border-dashed bg-surface px-4 py-8 text-center text-muted text-sm">
              Nenhum lugar com esses filtros tem coordenada cadastrada.{' '}
              <Link href="/estabelecimentos" className="text-primary hover:underline">
                Ver a lista completa
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {noMapa.map((estabelecimento) => {
                const selecionado = estabelecimento.id === selecionadoId;

                return (
                  <li key={estabelecimento.id}>
                    <button
                      type="button"
                      onClick={() => setSelecionadoId(estabelecimento.id)}
                      aria-current={selecionado}
                      className={`w-full rounded-card border bg-surface px-3 py-2.5 text-left transition-colors ${
                        selecionado ? 'border-primary' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <span className="block font-medium text-sm">{estabelecimento.nome}</span>
                      <span className="block text-muted text-xs">
                        {
                          rotulos.categoria[
                            estabelecimento.categoria as keyof typeof rotulos.categoria
                          ]
                        }{' '}
                        · {estabelecimento.bairro}
                      </span>

                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {[...new Set(estabelecimento.pagamentos.map((p) => p.cripto))].map(
                          (cripto) => (
                            <span
                              key={cripto}
                              className="rounded-control border border-border px-1.5 py-0.5 text-xs"
                            >
                              {cripto}
                            </span>
                          ),
                        )}
                      </span>

                      <span className="mt-2 flex items-center justify-between gap-2">
                        <VerificationBadge
                          status={estabelecimento.verificacao.status}
                          confirmadoEm={
                            confirmacaoMaisRecente(estabelecimento.pagamentos) ??
                            estabelecimento.verificacao.em
                          }
                        />
                        <Link
                          href={`/estabelecimentos/${estabelecimento.slug}`}
                          className="shrink-0 text-primary text-xs hover:underline"
                        >
                          Detalhes
                        </Link>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

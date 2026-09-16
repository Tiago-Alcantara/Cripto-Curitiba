'use client';

import type { Bairro, Cripto } from '@cripto/shared';
import { rotulos } from '@cripto/shared';

export type Filtros = {
  q: string;
  bairro: string[];
  categoria: string[];
  cripto: string[];
  metodo: string[];
  verificacao: string | null;
};

export const FILTROS_VAZIOS: Filtros = {
  q: '',
  bairro: [],
  categoria: [],
  cripto: [],
  metodo: [],
  verificacao: null,
};

type Props = {
  filtros: Filtros;
  bairros: Bairro[];
  criptos: Cripto[];
  categorias: string[];
  metodos: string[];
  aoMudar: (filtros: Filtros) => void;
  total: number;
};

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor];
}

function Chip({
  ativo,
  children,
  onClick,
}: {
  ativo: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        ativo
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-muted text-xs uppercase tracking-wide">{titulo}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function FilterBar({
  filtros,
  bairros,
  criptos,
  categorias,
  metodos,
  aoMudar,
  total,
}: Props) {
  const temFiltro =
    filtros.q !== '' ||
    filtros.bairro.length > 0 ||
    filtros.categoria.length > 0 ||
    filtros.cripto.length > 0 ||
    filtros.metodo.length > 0 ||
    filtros.verificacao !== null;

  return (
    <div className="space-y-5 rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Buscar por nome ou bairro</span>
          <input
            type="search"
            value={filtros.q}
            onChange={(evento) => aoMudar({ ...filtros, q: evento.target.value })}
            placeholder="Buscar por nome ou bairro"
            className="w-full rounded-control border border-border bg-background px-3 py-2 text-sm placeholder:text-muted"
          />
        </label>

        <p className="text-muted text-sm" aria-live="polite">
          {total} {total === 1 ? 'lugar' : 'lugares'}
        </p>
      </div>

      <Grupo titulo="Criptomoeda">
        {criptos
          .filter((cripto) => cripto.totalEstabelecimentos > 0)
          .map((cripto) => (
            <Chip
              key={cripto.symbol}
              ativo={filtros.cripto.includes(cripto.symbol)}
              onClick={() =>
                aoMudar({ ...filtros, cripto: alternar(filtros.cripto, cripto.symbol) })
              }
            >
              {cripto.symbol}
            </Chip>
          ))}
      </Grupo>

      <Grupo titulo="Forma de pagamento">
        {metodos.map((metodo) => (
          <Chip
            key={metodo}
            ativo={filtros.metodo.includes(metodo)}
            onClick={() => aoMudar({ ...filtros, metodo: alternar(filtros.metodo, metodo) })}
          >
            {rotulos.metodo[metodo as keyof typeof rotulos.metodo] ?? metodo}
          </Chip>
        ))}
      </Grupo>

      <Grupo titulo="Categoria">
        {categorias.map((categoria) => (
          <Chip
            key={categoria}
            ativo={filtros.categoria.includes(categoria)}
            onClick={() =>
              aoMudar({ ...filtros, categoria: alternar(filtros.categoria, categoria) })
            }
          >
            {rotulos.categoria[categoria as keyof typeof rotulos.categoria] ?? categoria}
          </Chip>
        ))}
      </Grupo>

      <Grupo titulo="Bairro">
        {bairros.map((bairro) => (
          <Chip
            key={bairro.bairro}
            ativo={filtros.bairro.includes(bairro.bairro)}
            onClick={() => aoMudar({ ...filtros, bairro: alternar(filtros.bairro, bairro.bairro) })}
          >
            {bairro.bairro} <span className="opacity-60">{bairro.totalEstabelecimentos}</span>
          </Chip>
        ))}
      </Grupo>

      <Grupo titulo="Confiança">
        <Chip
          ativo={filtros.verificacao === 'verificado'}
          onClick={() =>
            aoMudar({
              ...filtros,
              verificacao: filtros.verificacao === 'verificado' ? null : 'verificado',
            })
          }
        >
          Só verificados
        </Chip>
      </Grupo>

      {temFiltro ? (
        <button
          type="button"
          onClick={() => aoMudar(FILTROS_VAZIOS)}
          className="text-primary text-sm hover:underline"
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );
}

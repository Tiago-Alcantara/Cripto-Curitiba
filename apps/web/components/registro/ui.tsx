import type { Verificacao } from '@cripto/shared';
import { estaDesatualizado, formatarMesAno } from '@/lib/formatters';

/*
 * Pecas basicas do v2 (docs/05-design.md): rotulo mono, cornija, calcada,
 * selo, tag de cripto e os estilos de botao. Tudo flat, raio de 2px.
 */

export const botaoPrimario =
  'inline-flex items-center justify-center rounded-[2px] bg-verde px-6 py-3.5 font-bold text-[12.5px] text-creme uppercase tracking-[0.11em] transition-colors hover:bg-verde-escuro hover:text-creme hover:no-underline disabled:cursor-wait disabled:opacity-70';

export const botaoSecundario =
  'inline-flex items-center justify-center rounded-[2px] border-[1.5px] border-tinta bg-transparent px-6 py-[12.5px] font-bold text-[12.5px] text-tinta uppercase tracking-[0.11em] transition-colors hover:bg-tinta hover:text-papel hover:no-underline';

export const linkTexto = 'text-verde hover:text-verde-escuro hover:underline';

export function Rotulo({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[10.5px] text-tinta-fraca uppercase tracking-[0.2em] ${className}`}
    >
      {children}
    </div>
  );
}

/** Divisor de secao: regua grossa (3px) + fina (1px), nunca uma borda solta. */
export function Cornija({ className = '' }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="h-[3px] bg-tinta" />
      <div className="mt-[3px] h-px bg-tinta" />
    </div>
  );
}

export function Calcada({ className = '' }: { className?: string }) {
  return <div className={`calcada ${className}`} aria-hidden />;
}

/** Eyebrow + titulo Bodoni + cornija: abertura padrao das paginas internas. */
export function AberturaPagina({
  rotulo,
  titulo,
  children,
  lateral,
}: {
  rotulo: string;
  titulo: React.ReactNode;
  children?: React.ReactNode;
  lateral?: React.ReactNode;
}) {
  return (
    <header>
      <Rotulo className="mb-2.5">{rotulo}</Rotulo>
      <div className="flex flex-wrap items-end justify-between gap-3 border-tinta border-b-[3px] pb-3">
        <h1 className="m-0 font-display font-medium text-[clamp(30px,4.4vw,44px)] leading-none">
          {titulo}
        </h1>
        {lateral}
      </div>
      <div className="h-px bg-tinta" />
      {children}
    </header>
  );
}

type SeloProps = {
  status: Verificacao;
  confirmadoEm?: string | null;
  tamanho?: 'sm' | 'md';
};

/**
 * O selo e o produto: sempre visivel, com a data da confirmacao. Retangulo
 * solido verde (verificado) ou tracejado ocre (comunidade) — carimbo, nao pill.
 * Informacao com mais de um ano vira pedido de recheck.
 */
export function Selo({ status, confirmadoEm, tamanho = 'sm' }: SeloProps) {
  const data = formatarMesAno(confirmadoEm ?? null);
  const base = `inline-flex items-center self-start rounded-[2px] font-bold font-mono uppercase tracking-[0.12em] ${
    tamanho === 'md' ? 'px-2.5 py-[5px] text-[10px]' : 'px-2 py-1 text-[9px]'
  }`;

  if (estaDesatualizado(confirmadoEm ?? null)) {
    return (
      <span className={`${base} border border-tinta-fraca border-dashed text-tinta-fraca`}>
        Confirmar informação{data ? ` · ${data}` : ''}
      </span>
    );
  }

  if (status === 'verificado') {
    return (
      <span className={`${base} bg-verde text-creme`}>Verificado{data ? ` · ${data}` : ''}</span>
    );
  }

  if (status === 'comunidade') {
    return (
      <span className={`${base} border border-ocre border-dashed text-ocre-escuro`}>
        Reportado pela comunidade
      </span>
    );
  }

  return <span className={`${base} border border-regua text-tinta-fraca`}>Não verificado</span>;
}

export function TagCripto({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[2px] border border-regua px-[7px] py-[3px] font-mono text-[10.5px] text-tinta-media">
      {children}
    </span>
  );
}

/** Slot de foto sem foto real: listrado, com rotulo mono entre colchetes. */
export function FotoPlaceholder({
  rotulo,
  className = '',
}: {
  rotulo: string;
  className?: string;
}) {
  return (
    <div className={`foto-listrada flex items-center justify-center ${className}`}>
      <span className="font-mono text-[#5f584b] text-[10px] tracking-[0.1em]">{rotulo}</span>
    </div>
  );
}

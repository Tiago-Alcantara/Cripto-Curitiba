import { rotulos, type Verificacao } from '@cripto/shared';
import { estaDesatualizado, formatarMesAno } from '@/lib/formatters';

type Props = {
  status: Verificacao;
  confirmadoEm?: string | null;
  tamanho?: 'sm' | 'md';
};

/**
 * O selo e o produto: quem olha precisa saber, antes de mais nada, se pode
 * confiar no dado e de quando ele e.
 */
export function VerificationBadge({ status, confirmadoEm, tamanho = 'sm' }: Props) {
  const data = formatarMesAno(confirmadoEm ?? null);
  const desatualizado = estaDesatualizado(confirmadoEm ?? null);
  const padding = tamanho === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  if (desatualizado) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface font-medium text-muted ${padding}`}
      >
        <span aria-hidden>↻</span>
        Confirmar informação{data ? ` · ${data}` : ''}
      </span>
    );
  }

  if (status === 'verificado') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-verified font-medium text-white ${padding}`}
      >
        <span aria-hidden>✓</span>
        {rotulos.verificacao.verificado}
        {data ? ` · ${data}` : ''}
      </span>
    );
  }

  if (status === 'comunidade') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-community font-medium text-community ${padding}`}
      >
        <span aria-hidden>◎</span>
        {rotulos.verificacao.comunidade}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border font-medium text-muted ${padding}`}
    >
      {rotulos.verificacao['nao-verificado']}
    </span>
  );
}

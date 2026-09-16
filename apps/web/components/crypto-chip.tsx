import type { Pagamento } from '@cripto/shared';
import { descreverPagamento } from '@/lib/formatters';

/**
 * Nunca comunica so por cor: o simbolo e o metodo aparecem sempre em texto
 * (docs/05-design.md, acessibilidade).
 */
export function CryptoChip({ pagamento }: { pagamento: Pagamento }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-control border border-border bg-surface px-2 py-1 text-xs text-foreground">
      <strong className="font-semibold">{pagamento.cripto}</strong>
      <span className="text-muted">·</span>
      <span className="text-muted">{descreverPagamento(pagamento)}</span>
    </span>
  );
}

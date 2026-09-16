import type { EstabelecimentoAdmin } from '@cripto/shared';
import Link from 'next/link';
import { EstablishmentActions } from '@/components/admin/establishment-actions';
import { chamarApi } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

type Lista = { data: EstabelecimentoAdmin[]; meta: { total: number } };

const CORES_STATUS: Record<string, string> = {
  publicado: 'bg-verified text-white',
  rascunho: 'border border-border text-muted',
  arquivado: 'border border-border text-muted line-through',
};

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function EstabelecimentosAdmin({ searchParams }: Props) {
  const { status, q } = await searchParams;

  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (q) query.set('q', q);

  const resultado = await chamarApi<Lista>(
    `/admin/estabelecimentos${query.toString() ? `?${query}` : ''}`,
  );

  if (!resultado.ok) {
    return (
      <p className="rounded-card border border-danger/40 bg-surface p-4 text-danger text-sm">
        {resultado.mensagem}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Estabelecimentos</h1>
          <p className="mt-1 text-muted text-sm">{resultado.dados.meta.total} no total</p>
        </div>

        <Link
          href="/admin/estabelecimentos/novo"
          className="rounded-control bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary-hover"
        >
          Novo estabelecimento
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2 text-sm">
        {[
          { rotulo: 'Todos', valor: undefined },
          { rotulo: 'Rascunhos', valor: 'rascunho' },
          { rotulo: 'Publicados', valor: 'publicado' },
          { rotulo: 'Arquivados', valor: 'arquivado' },
        ].map((filtro) => (
          <Link
            key={filtro.rotulo}
            href={
              filtro.valor
                ? `/admin/estabelecimentos?status=${filtro.valor}`
                : '/admin/estabelecimentos'
            }
            className={`rounded-full border px-3 py-1.5 ${
              status === filtro.valor
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-muted hover:text-foreground'
            }`}
          >
            {filtro.rotulo}
          </Link>
        ))}
      </nav>

      {resultado.dados.data.length === 0 ? (
        <p className="rounded-card border border-border border-dashed bg-surface px-6 py-12 text-center text-muted">
          Nenhum estabelecimento com esse filtro.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {resultado.dados.data.map((estabelecimento) => (
            <li
              key={estabelecimento.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/estabelecimentos/${estabelecimento.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {estabelecimento.nome}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      CORES_STATUS[estabelecimento.status] ?? ''
                    }`}
                  >
                    {estabelecimento.status}
                  </span>
                  {estabelecimento.verificacao.status === 'verificado' ? (
                    <span className="text-verified text-xs">✓ verificado</span>
                  ) : (
                    <span className="text-community text-xs">◎ comunidade</span>
                  )}
                </div>
                <p className="truncate text-muted text-sm">
                  {estabelecimento.bairro} ·{' '}
                  {estabelecimento.pagamentos.map((p) => `${p.cripto}/${p.metodo}`).join(', ') ||
                    'sem pagamento'}
                </p>
              </div>

              <EstablishmentActions
                id={estabelecimento.id}
                status={estabelecimento.status}
                verificacao={estabelecimento.verificacao.status}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

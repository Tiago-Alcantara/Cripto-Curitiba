import type { SugestaoAdmin } from '@cripto/shared';
import { SuggestionQueue } from '@/components/admin/suggestion-queue';
import { chamarApi } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

type Lista = { data: SugestaoAdmin[]; meta: { total: number } };

export default async function AdminHome() {
  const resultado = await chamarApi<Lista>('/admin/sugestoes?status=pendente');

  if (!resultado.ok) {
    return (
      <p className="rounded-card border border-danger/40 bg-surface p-4 text-danger text-sm">
        {resultado.mensagem}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Fila de moderação</h1>
        <p className="mt-1 text-muted text-sm">
          {resultado.dados.meta.total === 0
            ? 'Nenhuma sugestão pendente.'
            : `${resultado.dados.meta.total} ${
                resultado.dados.meta.total === 1 ? 'sugestão pendente' : 'sugestões pendentes'
              }.`}{' '}
          Aprovar cria um rascunho — publicar continua sendo decisão sua.
        </p>
      </header>

      <SuggestionQueue sugestoes={resultado.dados.data} />
    </div>
  );
}

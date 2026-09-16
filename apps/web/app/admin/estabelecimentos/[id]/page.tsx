import type { Cripto, EstabelecimentoAdmin } from '@cripto/shared';
import Link from 'next/link';
import { EstablishmentForm } from '@/components/admin/establishment-form';
import { chamarApi } from '@/lib/admin-session';
import { listarCriptomoedas, tolerante } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditorEstabelecimento({ params }: Props) {
  const { id } = await params;
  const novo = id === 'novo';

  const [criptos, resultado] = await Promise.all([
    tolerante(listarCriptomoedas(), [] as Cripto[]),
    novo ? Promise.resolve(null) : chamarApi<EstabelecimentoAdmin>(`/admin/estabelecimentos/${id}`),
  ]);

  if (resultado && !resultado.ok) {
    return (
      <div className="space-y-4">
        <p className="rounded-card border border-danger/40 bg-surface p-4 text-danger text-sm">
          {resultado.mensagem}
        </p>
        <Link href="/admin/estabelecimentos" className="text-primary text-sm hover:underline">
          ← Voltar
        </Link>
      </div>
    );
  }

  const estabelecimento = resultado?.ok ? resultado.dados : null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/estabelecimentos" className="text-muted text-sm hover:text-foreground">
          ← Estabelecimentos
        </Link>
        <h1 className="mt-2 font-display text-3xl">
          {estabelecimento ? estabelecimento.nome : 'Novo estabelecimento'}
        </h1>
        {estabelecimento ? (
          <p className="mt-1 text-muted text-sm">
            /{estabelecimento.slug} · {estabelecimento.status}
          </p>
        ) : (
          <p className="mt-1 text-muted text-sm">
            Entra como rascunho. Publicar é um passo separado.
          </p>
        )}
      </header>

      <EstablishmentForm estabelecimento={estabelecimento} criptos={criptos} />
    </div>
  );
}

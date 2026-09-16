'use client';

import type { SugestaoAdmin } from '@cripto/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROTULO_TIPO: Record<string, string> = {
  novo_local: 'Novo local',
  atualizacao: 'Atualização',
  reporte_erro: 'Reporte de erro',
};

export function SuggestionQueue({ sugestoes }: { sugestoes: SugestaoAdmin[] }) {
  const router = useRouter();
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function moderar(id: string, acao: 'aprovar' | 'rejeitar', spam = false) {
    setProcessando(id);
    setErro(null);

    try {
      const resposta = await fetch(`/api/admin/sugestoes/${id}/${acao}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(acao === 'rejeitar' ? { spam } : {}),
      });

      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(corpo?.error?.message ?? 'Falha ao moderar');
      }

      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao moderar');
    } finally {
      setProcessando(null);
    }
  }

  if (sugestoes.length === 0) {
    return (
      <p className="rounded-card border border-border border-dashed bg-surface px-6 py-12 text-center text-muted">
        Fila vazia. Nada esperando moderação.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {erro ? (
        <p className="rounded-control border border-danger/40 px-3 py-2 text-danger text-sm">
          {erro}
        </p>
      ) : null}

      {sugestoes.map((sugestao) => {
        const dados = (sugestao.dados ?? {}) as Record<string, unknown>;

        return (
          <article key={sugestao.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full border border-border px-2 py-0.5 text-muted text-xs">
                  {ROTULO_TIPO[sugestao.tipo] ?? sugestao.tipo}
                </span>
                <h2 className="mt-2 font-semibold">
                  {(dados.nome as string) ?? sugestao.estabelecimento?.nome ?? 'Sem nome'}
                </h2>
                <p className="text-muted text-sm">
                  {[dados.bairro, dados.endereco].filter(Boolean).join(' · ') || 'Sem endereço'}
                </p>
              </div>

              <time className="text-muted text-xs">
                {new Date(sugestao.criadaEm).toLocaleString('pt-BR')}
              </time>
            </div>

            {sugestao.mensagem ? (
              <p className="mt-3 rounded-control bg-background px-3 py-2 text-sm">
                {sugestao.mensagem}
              </p>
            ) : null}

            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {Array.isArray(dados.criptos) && dados.criptos.length > 0 ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Criptos:</dt>
                  <dd>{(dados.criptos as string[]).join(', ')}</dd>
                </div>
              ) : null}
              {Array.isArray(dados.metodos) && dados.metodos.length > 0 ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Formas:</dt>
                  <dd>{(dados.metodos as string[]).join(', ')}</dd>
                </div>
              ) : null}
              {sugestao.remetente.email ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Contato:</dt>
                  <dd>
                    {sugestao.remetente.nome ?? 'anônimo'} · {sugestao.remetente.email}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={processando === sugestao.id}
                onClick={() => moderar(sugestao.id, 'aprovar')}
                className="rounded-control bg-primary px-3 py-1.5 font-medium text-sm text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Aprovar (vira rascunho)
              </button>
              <button
                type="button"
                disabled={processando === sugestao.id}
                onClick={() => moderar(sugestao.id, 'rejeitar')}
                className="rounded-control border border-border px-3 py-1.5 text-sm hover:border-danger/40 disabled:opacity-50"
              >
                Rejeitar
              </button>
              <button
                type="button"
                disabled={processando === sugestao.id}
                onClick={() => moderar(sugestao.id, 'rejeitar', true)}
                className="rounded-control border border-border px-3 py-1.5 text-muted text-sm hover:border-danger/40 disabled:opacity-50"
              >
                Spam
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

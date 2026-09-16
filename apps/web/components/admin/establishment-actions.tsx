'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  id: string;
  status: string;
  verificacao: string;
};

export function EstablishmentActions({ id, status, verificacao }: Props) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function acao(caminho: string, corpo?: object) {
    setOcupado(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/admin/estabelecimentos/${id}/${caminho}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo ?? {}),
      });

      if (!resposta.ok) {
        const dados = (await resposta.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(dados?.error?.message ?? 'Falha na ação');
      }

      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha na ação');
    } finally {
      setOcupado(false);
    }
  }

  const botao =
    'rounded-control border border-border px-2.5 py-1 text-xs hover:border-primary/40 disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {erro ? <span className="text-danger text-xs">{erro}</span> : null}

      {status !== 'publicado' ? (
        <button type="button" disabled={ocupado} onClick={() => acao('publicar')} className={botao}>
          Publicar
        </button>
      ) : (
        <button type="button" disabled={ocupado} onClick={() => acao('arquivar')} className={botao}>
          Arquivar
        </button>
      )}

      {verificacao !== 'verificado' ? (
        <button
          type="button"
          disabled={ocupado}
          onClick={() => acao('verificar', { status: 'verificado', confirmarPagamentos: true })}
          className={botao}
        >
          Marcar verificado
        </button>
      ) : (
        <button
          type="button"
          disabled={ocupado}
          onClick={() => acao('verificar', { status: 'comunidade', confirmarPagamentos: false })}
          className={botao}
        >
          Tirar verificação
        </button>
      )}
    </div>
  );
}

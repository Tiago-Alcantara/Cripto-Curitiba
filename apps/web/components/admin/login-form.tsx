'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const destino = parametros.get('de') ?? '/admin';

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEntrando(true);

    const dados = new FormData(evento.currentTarget);

    try {
      const resposta = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: dados.get('email'), senha: dados.get('senha') }),
      });

      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(corpo?.error?.message ?? 'Não foi possível entrar');
      }

      router.replace(destino);
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível entrar');
      setEntrando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="mt-8 space-y-4">
      <label className="block space-y-1">
        <span className="font-medium text-sm">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="font-medium text-sm">Senha</span>
        <input
          type="password"
          name="senha"
          required
          autoComplete="current-password"
          className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      {erro ? (
        <p className="rounded-control border border-danger/40 px-3 py-2 text-danger text-sm">
          {erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={entrando}
        className="w-full rounded-control bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {entrando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

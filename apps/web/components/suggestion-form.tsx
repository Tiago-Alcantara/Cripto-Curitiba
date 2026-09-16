'use client';

import type { Cripto } from '@cripto/shared';
import { categorias, metodosPagamento, rotulos } from '@cripto/shared';
import { useState } from 'react';

type Tipo = 'novo_local' | 'atualizacao' | 'reporte_erro';

type Props = {
  criptos: Cripto[];
  tipoInicial?: Tipo;
  estabelecimentoInicial?: { id: string; nome: string } | null;
};

const TITULOS: Record<Tipo, string> = {
  novo_local: 'Sugerir um lugar novo',
  atualizacao: 'Atualizar informação de um lugar',
  reporte_erro: 'Reportar um erro',
};

const campo =
  'w-full rounded-control border border-border bg-background px-3 py-2 text-sm placeholder:text-muted';

export function SuggestionForm({ criptos, tipoInicial, estabelecimentoInicial }: Props) {
  const [tipo, setTipo] = useState<Tipo>(tipoInicial ?? 'novo_local');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [criptosEscolhidas, setCriptosEscolhidas] = useState<string[]>([]);
  const [metodosEscolhidos, setMetodosEscolhidos] = useState<string[]>([]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (enviado) {
    return (
      <div className="rounded-card border border-verified/30 bg-surface p-6">
        <h2 className="font-semibold text-xl">Recebido, obrigado!</h2>
        <p className="mt-2 text-muted">
          Sua sugestão entrou na fila de moderação. Nada é publicado antes de alguém conferir — é
          isso que mantém o diretório confiável.
        </p>
        <button
          type="button"
          onClick={() => {
            setEnviado(false);
            setCriptosEscolhidas([]);
            setMetodosEscolhidos([]);
          }}
          className="mt-4 text-primary text-sm hover:underline"
        >
          Enviar outra sugestão
        </button>
      </div>
    );
  }

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const dadosFormulario = new FormData(evento.currentTarget);
    const texto = (chave: string) => {
      const valor = dadosFormulario.get(chave);
      return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined;
    };

    const corpo = {
      tipo,
      estabelecimentoId: estabelecimentoInicial?.id ?? null,
      dados: {
        nome: texto('nome'),
        bairro: texto('bairro'),
        endereco: texto('endereco'),
        categoria: texto('categoria'),
        criptos: criptosEscolhidas.length > 0 ? criptosEscolhidas : undefined,
        metodos: metodosEscolhidos.length > 0 ? metodosEscolhidos : undefined,
        contato: texto('contato'),
      },
      mensagem: texto('mensagem'),
      remetente: { nome: texto('remetenteNome'), email: texto('remetenteEmail') },
      turnstileToken: texto('cf-turnstile-response'),
      website: texto('website'),
    };

    try {
      const resposta = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      });

      if (!resposta.ok) {
        const problema = (await resposta.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(problema?.error?.message ?? 'Não foi possível enviar agora.');
      }

      setEnviado(true);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar agora.');
    } finally {
      setEnviando(false);
    }
  }

  function alternar(lista: string[], valor: string, definir: (novo: string[]) => void) {
    definir(lista.includes(valor) ? lista.filter((i) => i !== valor) : [...lista, valor]);
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="font-medium text-muted text-xs uppercase tracking-wide">
          O que você quer fazer
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TITULOS) as Tipo[]).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setTipo(opcao)}
              aria-pressed={tipo === opcao}
              disabled={Boolean(estabelecimentoInicial) && opcao === 'novo_local'}
              className={`rounded-full border px-3 py-1.5 text-sm disabled:opacity-40 ${
                tipo === opcao
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-muted hover:text-foreground'
              }`}
            >
              {TITULOS[opcao]}
            </button>
          ))}
        </div>
      </fieldset>

      {estabelecimentoInicial ? (
        <p className="rounded-control border border-border bg-surface px-3 py-2 text-sm">
          Sobre: <strong>{estabelecimentoInicial.nome}</strong>
        </p>
      ) : null}

      {tipo === 'novo_local' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="font-medium text-sm">Nome do lugar *</span>
            <input name="nome" required maxLength={120} className={campo} />
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Bairro</span>
            <input name="bairro" maxLength={80} className={campo} />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="font-medium text-sm">Endereço</span>
            <input name="endereco" maxLength={200} className={campo} />
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Categoria</span>
            <select name="categoria" className={campo} defaultValue="">
              <option value="">Não sei</option>
              {Object.values(categorias).map((categoria) => (
                <option key={categoria} value={categoria}>
                  {rotulos.categoria[categoria]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Contato do lugar</span>
            <input
              name="contato"
              maxLength={120}
              className={campo}
              placeholder="telefone, @, site"
            />
          </label>
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="font-medium text-sm">Quais criptos aceita</legend>
        <div className="flex flex-wrap gap-2">
          {criptos.map((cripto) => (
            <button
              key={cripto.symbol}
              type="button"
              onClick={() => alternar(criptosEscolhidas, cripto.symbol, setCriptosEscolhidas)}
              aria-pressed={criptosEscolhidas.includes(cripto.symbol)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                criptosEscolhidas.includes(cripto.symbol)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-muted'
              }`}
            >
              {cripto.symbol}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-medium text-sm">Como paga</legend>
        <div className="flex flex-wrap gap-2">
          {Object.values(metodosPagamento).map((metodo) => (
            <button
              key={metodo}
              type="button"
              onClick={() => alternar(metodosEscolhidos, metodo, setMetodosEscolhidos)}
              aria-pressed={metodosEscolhidos.includes(metodo)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                metodosEscolhidos.includes(metodo)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-muted'
              }`}
            >
              {rotulos.metodo[metodo]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="font-medium text-sm">
          {tipo === 'reporte_erro' ? 'O que está errado? *' : 'Detalhes'}
        </span>
        <textarea
          name="mensagem"
          rows={4}
          required={tipo !== 'novo_local'}
          maxLength={2000}
          className={campo}
          placeholder="Conte como você sabe: pagou lá, viu o aviso na porta, falou com o dono…"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-medium text-sm">Seu nome</span>
          <input name="remetenteNome" maxLength={80} className={campo} />
        </label>
        <label className="space-y-1">
          <span className="font-medium text-sm">Seu e-mail</span>
          <input type="email" name="remetenteEmail" maxLength={160} className={campo} />
        </label>
      </div>
      <p className="text-muted text-xs">
        Nome e e-mail são opcionais e servem só para tirar dúvidas sobre o envio. Nada disso é
        publicado.
      </p>

      {/* Honeypot: invisivel para gente, irresistivel para bot. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Não preencha este campo
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {siteKey ? <div className="cf-turnstile" data-sitekey={siteKey} /> : null}

      {erro ? (
        <p className="rounded-control border border-danger/40 bg-surface px-3 py-2 text-danger text-sm">
          {erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-control bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {enviando ? 'Enviando…' : 'Enviar sugestão'}
      </button>
    </form>
  );
}

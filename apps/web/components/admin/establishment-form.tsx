'use client';

import type { Cripto, EstabelecimentoAdmin } from '@cripto/shared';
import { categorias, custodias, metodosPagamento, rotulos } from '@cripto/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PagamentoLinha = {
  cripto: string;
  metodo: string;
  rede: string;
  custodia: string;
  observacao: string;
};

type Props = {
  estabelecimento: EstabelecimentoAdmin | null;
  criptos: Cripto[];
};

const campo =
  'w-full rounded-control border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted';

function linhasIniciais(estabelecimento: EstabelecimentoAdmin | null): PagamentoLinha[] {
  if (!estabelecimento || estabelecimento.pagamentos.length === 0) {
    return [
      { cripto: 'BTC', metodo: 'lightning', rede: '', custodia: 'nao-informado', observacao: '' },
    ];
  }

  return estabelecimento.pagamentos.map((pagamento) => ({
    cripto: pagamento.cripto,
    metodo: pagamento.metodo,
    rede: pagamento.rede ?? '',
    custodia: pagamento.custodia,
    observacao: pagamento.observacao ?? '',
  }));
}

export function EstablishmentForm({ estabelecimento, criptos }: Props) {
  const router = useRouter();
  const [pagamentos, setPagamentos] = useState<PagamentoLinha[]>(linhasIniciais(estabelecimento));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const simbolos = criptos.length > 0 ? criptos.map((c) => c.symbol) : ['BTC', 'USDT', 'ETH'];

  function atualizarLinha(indice: number, campos: Partial<PagamentoLinha>) {
    setPagamentos((atual) =>
      atual.map((linha, i) => (i === indice ? { ...linha, ...campos } : linha)),
    );
  }

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    setSalvo(false);

    const dados = new FormData(evento.currentTarget);
    const texto = (chave: string) => {
      const valor = dados.get(chave);
      return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
    };
    const numero = (chave: string) => {
      const valor = texto(chave);
      return valor === null ? null : Number(valor);
    };

    const corpo = {
      nome: texto('nome'),
      slug: texto('slug') ?? undefined,
      descricao: texto('descricao'),
      categoria: texto('categoria'),
      bairro: texto('bairro'),
      rua: texto('rua'),
      numero: texto('numeroEndereco'),
      cep: texto('cep'),
      latitude: numero('latitude'),
      longitude: numero('longitude'),
      faixaPreco: numero('faixaPreco'),
      telefone: texto('telefone'),
      whatsapp: texto('whatsapp'),
      email: texto('email'),
      site: texto('site'),
      instagram: texto('instagram'),
      googleMaps: texto('googleMaps'),
      cardapio: texto('cardapio'),
      pagamentos: pagamentos
        .filter((linha) => linha.cripto && linha.metodo)
        .map((linha) => ({
          cripto: linha.cripto,
          metodo: linha.metodo,
          rede: linha.rede || null,
          custodia: linha.custodia,
          observacao: linha.observacao || null,
        })),
    };

    try {
      const resposta = await fetch(
        estabelecimento
          ? `/api/admin/estabelecimentos/${estabelecimento.id}`
          : '/api/admin/estabelecimentos',
        {
          method: estabelecimento ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(corpo),
        },
      );

      const resultado = (await resposta.json().catch(() => null)) as
        | (EstabelecimentoAdmin & { error?: { message?: string } })
        | null;

      if (!resposta.ok) {
        throw new Error(resultado?.error?.message ?? 'Não foi possível salvar');
      }

      setSalvo(true);

      if (!estabelecimento && resultado?.id) {
        router.replace(`/admin/estabelecimentos/${resultado.id}`);
      }

      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-8">
      <section className="space-y-4 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Identificação</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="font-medium text-sm">Nome *</span>
            <input name="nome" required defaultValue={estabelecimento?.nome} className={campo} />
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Slug</span>
            <input
              name="slug"
              defaultValue={estabelecimento?.slug}
              placeholder="gerado a partir do nome"
              className={campo}
            />
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Categoria *</span>
            <select
              name="categoria"
              required
              defaultValue={estabelecimento?.categoria ?? 'restaurante'}
              className={campo}
            >
              {Object.values(categorias).map((categoria) => (
                <option key={categoria} value={categoria}>
                  {rotulos.categoria[categoria]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-medium text-sm">Faixa de preço (1 a 4)</span>
            <input
              type="number"
              min={1}
              max={4}
              name="faixaPreco"
              defaultValue={estabelecimento?.faixaPreco ?? ''}
              className={campo}
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="font-medium text-sm">Descrição</span>
            <textarea
              name="descricao"
              rows={3}
              defaultValue={estabelecimento?.descricao ?? ''}
              className={campo}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Endereço</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="font-medium text-sm">Bairro *</span>
            <input
              name="bairro"
              required
              defaultValue={estabelecimento?.endereco.bairro}
              className={campo}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-sm">Rua</span>
            <input
              name="rua"
              defaultValue={estabelecimento?.endereco.rua ?? ''}
              className={campo}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-sm">Número</span>
            <input
              name="numeroEndereco"
              defaultValue={estabelecimento?.endereco.numero ?? ''}
              className={campo}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-sm">CEP</span>
            <input
              name="cep"
              defaultValue={estabelecimento?.endereco.cep ?? ''}
              className={campo}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-sm">Latitude</span>
            <input
              name="latitude"
              defaultValue={estabelecimento?.latitude ?? ''}
              placeholder="-25.4284"
              className={campo}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-sm">Longitude</span>
            <input
              name="longitude"
              defaultValue={estabelecimento?.longitude ?? ''}
              placeholder="-49.2733"
              className={campo}
            />
          </label>
        </div>
        <p className="text-muted text-xs">Sem coordenada, o lugar fica na lista mas não no mapa.</p>
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Formas de pagamento</h2>
          <button
            type="button"
            onClick={() =>
              setPagamentos((atual) => [
                ...atual,
                {
                  cripto: 'BTC',
                  metodo: 'lightning',
                  rede: '',
                  custodia: 'nao-informado',
                  observacao: '',
                },
              ])
            }
            className="rounded-control border border-border px-3 py-1.5 text-sm hover:border-primary/40"
          >
            Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {pagamentos.map((linha, indice) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: linhas sao reordenaveis so por remocao
            <div key={indice} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <select
                value={linha.cripto}
                onChange={(e) => atualizarLinha(indice, { cripto: e.target.value })}
                className={campo}
                aria-label="Criptomoeda"
              >
                {simbolos.map((simbolo) => (
                  <option key={simbolo} value={simbolo}>
                    {simbolo}
                  </option>
                ))}
              </select>

              <select
                value={linha.metodo}
                onChange={(e) => atualizarLinha(indice, { metodo: e.target.value })}
                className={campo}
                aria-label="Forma de pagamento"
              >
                {Object.values(metodosPagamento).map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {rotulos.metodo[metodo]}
                  </option>
                ))}
              </select>

              <input
                value={linha.rede}
                onChange={(e) => atualizarLinha(indice, { rede: e.target.value })}
                placeholder="rede (Polygon…)"
                className={campo}
                aria-label="Rede"
              />

              <select
                value={linha.custodia}
                onChange={(e) => atualizarLinha(indice, { custodia: e.target.value })}
                className={campo}
                aria-label="Custódia"
              >
                {Object.values(custodias).map((custodia) => (
                  <option key={custodia} value={custodia}>
                    {rotulos.custodia[custodia]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setPagamentos((atual) => atual.filter((_, i) => i !== indice))}
                className="rounded-control border border-border px-3 text-muted text-sm hover:border-danger/40 hover:text-danger"
                aria-label="Remover forma de pagamento"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Contato</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { nome: 'telefone', rotulo: 'Telefone', valor: estabelecimento?.contato.telefone },
            { nome: 'whatsapp', rotulo: 'WhatsApp', valor: estabelecimento?.contato.whatsapp },
            { nome: 'email', rotulo: 'E-mail', valor: estabelecimento?.contato.email },
            { nome: 'site', rotulo: 'Site', valor: estabelecimento?.contato.site },
            { nome: 'instagram', rotulo: 'Instagram', valor: estabelecimento?.contato.instagram },
            {
              nome: 'googleMaps',
              rotulo: 'Google Maps',
              valor: estabelecimento?.contato.googleMaps,
            },
            { nome: 'cardapio', rotulo: 'Cardápio', valor: estabelecimento?.contato.cardapio },
          ].map((item) => (
            <label key={item.nome} className="space-y-1">
              <span className="font-medium text-sm">{item.rotulo}</span>
              <input name={item.nome} defaultValue={item.valor ?? ''} className={campo} />
            </label>
          ))}
        </div>
      </section>

      {erro ? (
        <p className="rounded-control border border-danger/40 px-3 py-2 text-danger text-sm">
          {erro}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-control bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        {salvo ? <span className="text-verified text-sm">Salvo.</span> : null}
      </div>
    </form>
  );
}

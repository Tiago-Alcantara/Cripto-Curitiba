'use client';

import type { Cripto } from '@cripto/shared';
import { categorias, rotulos } from '@cripto/shared';
import { useState } from 'react';
import { botaoPrimario, Cornija, Rotulo } from './ui';

type Tipo = 'novo_local' | 'atualizacao' | 'reporte_erro';

type Props = {
  criptos: Cripto[];
  tipoInicial?: Tipo;
  estabelecimentoInicial?: { id: string; nome: string } | null;
};

const LIGHTNING = 'Lightning';
const CRIPTOS_RESERVA = ['BTC', 'ETH', 'USDT'];

const FORM_VAZIO = {
  nome: '',
  categoria: '',
  bairro: '',
  contato: '',
  criptos: [] as string[],
  mensagem: '',
  remetenteNome: '',
  remetenteEmail: '',
  website: '',
};

const rotuloCampo =
  'mb-2 block font-bold font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.16em]';
const campoLinha =
  'w-full rounded-none border-0 border-regua border-b-[1.5px] bg-transparent px-0.5 py-[9px] text-[16px] text-tinta outline-none placeholder:text-tinta-fraca/80 focus:border-verde focus-visible:outline-none';

/**
 * Ficha de indicacao: o formulario e uma ficha numerada (`01 · NOME`). Envia
 * uma Suggestion real (POST /api/sugestoes -> API); nada e publicado sem
 * moderacao. Tambem atende "atualizar" e "reportar erro" vindos da ficha de um
 * local (?estabelecimento=slug).
 */
export function FichaIndicacao({ criptos, tipoInicial, estabelecimentoInicial }: Props) {
  const [tipo, setTipo] = useState<Tipo>(
    estabelecimentoInicial ? (tipoInicial ?? 'reporte_erro') : 'novo_local',
  );
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const novoLocal = tipo === 'novo_local';
  const opcoesCripto = [
    ...(criptos.length > 0 ? criptos.map((c) => c.symbol) : CRIPTOS_RESERVA),
    LIGHTNING,
  ];

  const faltando = novoLocal
    ? [
        !form.nome.trim() && 'nome',
        !form.categoria && 'ramo',
        !form.bairro.trim() && 'bairro',
      ].filter((item): item is string => Boolean(item))
    : [!form.mensagem.trim() && 'o que mudou'].filter((item): item is string => Boolean(item));
  const podeEnviar = faltando.length === 0;

  function atualizar<K extends keyof typeof FORM_VAZIO>(chave: K, valor: (typeof FORM_VAZIO)[K]) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  function alternarCripto(opcao: string) {
    atualizar(
      'criptos',
      form.criptos.includes(opcao)
        ? form.criptos.filter((item) => item !== opcao)
        : [...form.criptos, opcao],
    );
  }

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeEnviar) return;

    setErro(null);
    setEnviando(true);

    const texto = (valor: string) => valor.trim() || undefined;
    const moedas = form.criptos.filter((c) => c !== LIGHTNING);
    const turnstile = new FormData(evento.currentTarget).get('cf-turnstile-response');

    const corpo = {
      tipo,
      estabelecimentoId: estabelecimentoInicial?.id ?? null,
      dados: {
        nome: novoLocal ? texto(form.nome) : undefined,
        bairro: novoLocal ? texto(form.bairro) : undefined,
        categoria: novoLocal ? texto(form.categoria) : undefined,
        contato: novoLocal ? texto(form.contato) : undefined,
        criptos: moedas.length > 0 ? moedas : undefined,
        metodos: form.criptos.includes(LIGHTNING) ? ['lightning'] : undefined,
      },
      mensagem: texto(form.mensagem),
      remetente: { nome: texto(form.remetenteNome), email: texto(form.remetenteEmail) },
      turnstileToken: typeof turnstile === 'string' && turnstile ? turnstile : undefined,
      website: texto(form.website),
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

  if (enviado) {
    return (
      <div className="rounded-[2px] border border-tinta bg-papel-claro" role="status">
        <div className="bg-verde px-5 py-2.5 font-mono text-[10px] text-creme uppercase tracking-[0.18em]">
          Ficha recebida
        </div>
        <div className="px-8 pt-11 pb-10 text-center">
          <div className="mx-auto mb-[26px] h-11 w-11 rotate-45 bg-verde" aria-hidden />
          <h1 className="mt-0 mb-3 font-display font-medium text-[30px]">
            {novoLocal ? 'Indicação enviada' : 'Correção enviada'}
          </h1>
          <p className="mx-auto mt-0 mb-7 max-w-[380px] text-[15px] text-tinta-media leading-[1.65]">
            Obrigado por ajudar a mapear Curitiba. A equipe confirma a informação e publica com o
            selo adequado.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm(FORM_VAZIO);
              setEnviado(false);
            }}
            className={`${botaoPrimario} cursor-pointer border-0`}
          >
            Enviar outra
          </button>
        </div>
      </div>
    );
  }

  let numero = 0;
  const proximo = () => String(++numero).padStart(2, '0');

  return (
    <div>
      <Rotulo className="mb-2.5">Ficha de indicação</Rotulo>
      <h1 className="mt-0 mb-2.5 font-display font-medium text-[clamp(30px,4.4vw,44px)] leading-none">
        {novoLocal ? 'Indicar um local' : 'Corrigir um local'}
      </h1>
      <p className="mt-0 mb-1.5 text-[15px] text-tinta-media leading-[1.6]">
        Toda indicação passa por verificação manual antes de entrar no registro.
      </p>
      <Cornija className="mt-6 mb-8" />

      <form onSubmit={aoEnviar} className="flex flex-col gap-[26px]" noValidate>
        {estabelecimentoInicial ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 rounded-[2px] border border-regua bg-papel-claro px-3.5 py-2.5 text-[14px]">
              <span className="font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.14em]">
                Sobre ·{' '}
              </span>
              <strong className="font-display font-medium text-[17px]">
                {estabelecimentoInicial.nome}
              </strong>
            </p>
            <div className="flex flex-wrap gap-[7px]">
              {(['reporte_erro', 'atualizacao'] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setTipo(opcao)}
                  aria-pressed={tipo === opcao}
                  className={`cursor-pointer rounded-[2px] border px-[13px] py-[7px] text-[11.5px] uppercase tracking-[0.07em] ${
                    tipo === opcao
                      ? 'border-verde bg-verde font-bold text-creme'
                      : 'border-regua bg-transparent font-semibold text-tinta-media hover:border-tinta hover:text-tinta'
                  }`}
                >
                  {opcao === 'reporte_erro' ? 'Reportar um erro' : 'Atualizar informação'}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {novoLocal ? (
          <>
            <div>
              <label htmlFor="indicar-nome" className={rotuloCampo}>
                {proximo()} · Nome do estabelecimento
              </label>
              <input
                id="indicar-nome"
                value={form.nome}
                onChange={(e) => atualizar('nome', e.target.value)}
                placeholder="ex: Café das Araucárias"
                maxLength={120}
                required
                className={campoLinha}
              />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[26px]">
              <div>
                <label htmlFor="indicar-ramo" className={rotuloCampo}>
                  {proximo()} · Ramo
                </label>
                <select
                  id="indicar-ramo"
                  value={form.categoria}
                  onChange={(e) => atualizar('categoria', e.target.value)}
                  required
                  className={campoLinha}
                >
                  <option value="">Selecione…</option>
                  {Object.values(categorias).map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {rotulos.categoria[categoria]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="indicar-bairro" className={rotuloCampo}>
                  {proximo()} · Bairro
                </label>
                <input
                  id="indicar-bairro"
                  value={form.bairro}
                  onChange={(e) => atualizar('bairro', e.target.value)}
                  placeholder="ex: Batel"
                  maxLength={80}
                  required
                  className={campoLinha}
                />
              </div>
            </div>

            <div>
              <label htmlFor="indicar-contato" className={rotuloCampo}>
                {proximo()} · Instagram ou WhatsApp do local
              </label>
              <input
                id="indicar-contato"
                value={form.contato}
                onChange={(e) => atualizar('contato', e.target.value)}
                placeholder="@perfil ou número"
                maxLength={120}
                className={campoLinha}
              />
            </div>
          </>
        ) : null}

        <fieldset className="m-0 border-0 p-0">
          <legend className={`${rotuloCampo} mb-2.5 p-0`}>
            {proximo()} · Quais criptos esse local aceita
          </legend>
          <div className="flex flex-wrap gap-[7px]">
            {opcoesCripto.map((opcao) => {
              const ativo = form.criptos.includes(opcao);
              return (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => alternarCripto(opcao)}
                  aria-pressed={ativo}
                  className={`cursor-pointer rounded-[2px] border px-[13px] py-[7px] text-[11.5px] uppercase tracking-[0.07em] ${
                    ativo
                      ? 'border-verde bg-verde font-bold text-creme'
                      : 'border-regua bg-transparent font-semibold text-tinta-media hover:border-tinta hover:text-tinta'
                  }`}
                >
                  {opcao}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="indicar-observacao" className={rotuloCampo}>
            {proximo()} ·{' '}
            {novoLocal
              ? 'Observação (opcional)'
              : tipo === 'reporte_erro'
                ? 'O que está errado'
                : 'O que mudou'}
          </label>
          <textarea
            id="indicar-observacao"
            value={form.mensagem}
            onChange={(e) => atualizar('mensagem', e.target.value)}
            placeholder={
              novoLocal
                ? 'ex: aceitam via Lightning, falar com o gerente'
                : 'Conte como você sabe: pagou lá, viu o aviso na porta, falou com o dono…'
            }
            rows={3}
            maxLength={2000}
            required={!novoLocal}
            className="w-full resize-y rounded-[2px] border border-regua bg-papel-claro px-3 py-[11px] text-[15px] text-tinta outline-none focus:border-verde focus-visible:outline-none"
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[26px]">
          <div>
            <label htmlFor="indicar-remetente" className={rotuloCampo}>
              {proximo()} · Seu nome ou @ (opcional)
            </label>
            <input
              id="indicar-remetente"
              value={form.remetenteNome}
              onChange={(e) => atualizar('remetenteNome', e.target.value)}
              placeholder="pra te dar crédito na curadoria"
              maxLength={80}
              className={campoLinha}
            />
          </div>
          <div>
            <label htmlFor="indicar-email" className={rotuloCampo}>
              {proximo()} · Seu e-mail (opcional)
            </label>
            <input
              id="indicar-email"
              type="email"
              value={form.remetenteEmail}
              onChange={(e) => atualizar('remetenteEmail', e.target.value)}
              placeholder="só se a equipe precisar tirar dúvida"
              maxLength={160}
              className={campoLinha}
            />
          </div>
        </div>
        <p className="-mt-3 mb-0 font-mono text-[10px] text-tinta-fraca leading-[1.6] tracking-[0.04em]">
          Nome e e-mail não são publicados.
        </p>

        {/* Honeypot: invisivel para gente, irresistivel para bot. */}
        <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label>
            Não preencha este campo
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => atualizar('website', e.target.value)}
            />
          </label>
        </div>

        {siteKey ? <div className="cf-turnstile" data-sitekey={siteKey} /> : null}

        {erro ? (
          <p
            role="alert"
            className="m-0 rounded-[2px] border border-danger/50 bg-papel-claro px-3.5 py-2.5 text-[14px] text-danger"
          >
            {erro}
          </p>
        ) : null}

        <div className="border-regua border-t pt-[22px]">
          {podeEnviar ? (
            <button
              type="submit"
              disabled={enviando}
              className={`${botaoPrimario} cursor-pointer border-0 px-[30px] py-[15px]`}
            >
              {enviando ? 'Enviando…' : novoLocal ? 'Enviar indicação' : 'Enviar correção'}
            </button>
          ) : (
            <button
              type="submit"
              disabled
              className="cursor-not-allowed rounded-[2px] border-[1.5px] border-regua border-dashed bg-transparent px-[30px] py-3.5 font-bold text-[12.5px] text-tinta-fraca uppercase tracking-[0.09em]"
            >
              Preencha {faltando.join(', ').replace(/, ([^,]*)$/, ' e $1')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

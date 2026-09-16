import type { Prisma } from '@cripto/db';
import {
  type CriarEstabelecimento,
  categoriaParaBanco,
  custodiaParaBanco,
  type EditarEstabelecimento,
  metodoParaBanco,
  statusPublicacao,
  statusPublicacaoParaBanco,
  tiposSugestao,
  verificacaoParaBanco,
} from '@cripto/shared';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors.js';
import { slugDisponivel } from '../../shared/slug.js';
import type { UsuarioAutenticado } from '../auth/auth.service.js';
import {
  apresentarCompleto,
  type EstablishmentComRelacoes,
} from '../establishments/establishments.presenter.js';
import type { AdminRepository } from './admin.repository.js';

type Dependencias = {
  repository: AdminRepository;
  revalidar: (tags: string[]) => Promise<void>;
};

type EntradaPagamento = NonNullable<CriarEstabelecimento['pagamentos']>[number];

const statusSugestaoPublico = {
  PENDING: 'pendente',
  APPROVED: 'aprovada',
  REJECTED: 'rejeitada',
  SPAM: 'spam',
} as const;

function camposDoBanco(entrada: EditarEstabelecimento) {
  const dados: Prisma.EstablishmentUncheckedUpdateInput = {};

  if (entrada.nome !== undefined) dados.name = entrada.nome;
  if (entrada.descricao !== undefined) dados.description = entrada.descricao;
  if (entrada.categoria !== undefined) {
    dados.category = categoriaParaBanco[entrada.categoria as keyof typeof categoriaParaBanco];
  }
  if (entrada.faixaPreco !== undefined) dados.priceRange = entrada.faixaPreco;
  if (entrada.rua !== undefined) dados.street = entrada.rua;
  if (entrada.numero !== undefined) dados.number = entrada.numero;
  if (entrada.complemento !== undefined) dados.complement = entrada.complemento;
  if (entrada.bairro !== undefined) dados.neighborhood = entrada.bairro;
  if (entrada.cep !== undefined) dados.zipCode = entrada.cep;
  if (entrada.latitude !== undefined) dados.latitude = entrada.latitude;
  if (entrada.longitude !== undefined) dados.longitude = entrada.longitude;
  if (entrada.telefone !== undefined) dados.phone = entrada.telefone;
  if (entrada.whatsapp !== undefined) dados.whatsapp = entrada.whatsapp;
  if (entrada.email !== undefined) dados.email = entrada.email;
  if (entrada.site !== undefined) dados.website = entrada.site;
  if (entrada.instagram !== undefined) dados.instagram = entrada.instagram;
  if (entrada.googleMaps !== undefined) dados.googleMapsUrl = entrada.googleMaps;
  if (entrada.cardapio !== undefined) dados.menuUrl = entrada.cardapio;
  if (entrada.horarios !== undefined)
    dados.openingHours = entrada.horarios as Prisma.InputJsonValue;

  return dados;
}

export function criarAdminService({ repository, revalidar }: Dependencias) {
  async function pagamentosParaBanco(pagamentos: EntradaPagamento[]) {
    const preparados = [];

    for (const pagamento of pagamentos) {
      const crypto = await repository.cryptoPorSimbolo(pagamento.cripto);
      const metodo = metodoParaBanco[pagamento.metodo as keyof typeof metodoParaBanco];

      if (!metodo) {
        throw new ValidationError(`Forma de pagamento invalida: ${pagamento.metodo}`);
      }

      preparados.push({
        cryptoId: crypto.id,
        method: metodo,
        network: pagamento.rede ?? null,
        custody:
          custodiaParaBanco[
            (pagamento.custodia ?? 'nao-informado') as keyof typeof custodiaParaBanco
          ],
        note: pagamento.observacao ?? null,
        lastConfirmedAt: pagamento.confirmadoEm ? new Date(pagamento.confirmadoEm) : null,
      });
    }

    // O banco tem unique (estabelecimento, cripto, metodo): duplicata no payload
    // viraria erro cru do Prisma; melhor recusar com mensagem clara.
    const chaves = preparados.map((p) => `${p.cryptoId}:${p.method}`);
    if (new Set(chaves).size !== chaves.length) {
      throw new ValidationError('Ha formas de pagamento repetidas (mesma cripto e mesmo metodo)');
    }

    return preparados;
  }

  async function auditar(
    ator: UsuarioAutenticado,
    action: string,
    entity: string,
    entityId: string,
    diff?: object,
  ) {
    await repository.registrarAuditoria({
      actorId: ator.id,
      action,
      entity,
      entityId,
      diff: (diff ?? undefined) as Prisma.InputJsonValue | undefined,
    });
  }

  async function revalidarSlug(slug: string) {
    await revalidar(['estabelecimentos', `estabelecimento:${slug}`]);
  }

  return {
    async listar(filtros: {
      q?: string;
      status?: string;
      verificacao?: string;
      page: number;
      perPage: number;
    }) {
      const { registros, total } = await repository.listar({
        q: filtros.q,
        status: filtros.status
          ? statusPublicacaoParaBanco[filtros.status as keyof typeof statusPublicacaoParaBanco]
          : undefined,
        verificacao: filtros.verificacao
          ? verificacaoParaBanco[filtros.verificacao as keyof typeof verificacaoParaBanco]
          : undefined,
        page: filtros.page,
        perPage: filtros.perPage,
      });

      return {
        data: registros.map((registro) => ({
          ...apresentarCompleto(registro as EstablishmentComRelacoes),
          status: statusPublicacao[registro.status],
        })),
        meta: {
          page: filtros.page,
          perPage: filtros.perPage,
          total,
          totalPages: Math.max(1, Math.ceil(total / filtros.perPage)),
        },
      };
    },

    async porId(id: string) {
      const registro = await repository.porId(id);
      if (!registro) throw new NotFoundError('Estabelecimento');

      return {
        ...apresentarCompleto(registro as EstablishmentComRelacoes),
        status: statusPublicacao[registro.status],
      };
    },

    async criar(entrada: CriarEstabelecimento, ator: UsuarioAutenticado) {
      const slugPedido = entrada.slug;

      if (slugPedido && (await repository.slugExiste(slugPedido))) {
        throw new ConflictError(`Ja existe um estabelecimento com o slug "${slugPedido}"`);
      }

      const slug = slugPedido ?? (await slugDisponivel(entrada.nome, repository.slugExiste));
      const pagamentos = await pagamentosParaBanco(entrada.pagamentos ?? []);

      const criado = await repository.criar({
        ...(camposDoBanco(entrada) as Prisma.EstablishmentUncheckedCreateInput),
        slug,
        name: entrada.nome,
        neighborhood: entrada.bairro,
        category: categoriaParaBanco[entrada.categoria as keyof typeof categoriaParaBanco],
        status: 'DRAFT',
        verificationStatus: 'UNVERIFIED',
      });

      await repository.substituirPagamentos(criado.id, pagamentos);
      await auditar(ator, 'establishment.create', 'Establishment', criado.id, { slug });

      return this.porId(criado.id);
    },

    async editar(id: string, entrada: EditarEstabelecimento, ator: UsuarioAutenticado) {
      const atual = await repository.porId(id);
      if (!atual) throw new NotFoundError('Estabelecimento');

      if (
        entrada.slug &&
        entrada.slug !== atual.slug &&
        (await repository.slugExiste(entrada.slug))
      ) {
        throw new ConflictError(`Ja existe um estabelecimento com o slug "${entrada.slug}"`);
      }

      const dados = camposDoBanco(entrada);
      if (entrada.slug) dados.slug = entrada.slug;

      await repository.atualizar(id, dados);

      if (entrada.pagamentos) {
        await repository.substituirPagamentos(id, await pagamentosParaBanco(entrada.pagamentos));
      }

      await auditar(ator, 'establishment.update', 'Establishment', id, entrada as object);

      const atualizado = await this.porId(id);

      if (atual.status === 'PUBLISHED') {
        await revalidarSlug(atual.slug);
        if (entrada.slug && entrada.slug !== atual.slug) await revalidarSlug(entrada.slug);
      }

      return atualizado;
    },

    async publicar(id: string, ator: UsuarioAutenticado) {
      const atual = await repository.porId(id);
      if (!atual) throw new NotFoundError('Estabelecimento');

      await repository.atualizar(id, { status: 'PUBLISHED' });
      await auditar(ator, 'establishment.publish', 'Establishment', id);
      await revalidarSlug(atual.slug);

      return this.porId(id);
    },

    /** Arquivar e soft delete: o historico e a URL continuam existindo. */
    async arquivar(id: string, ator: UsuarioAutenticado) {
      const atual = await repository.porId(id);
      if (!atual) throw new NotFoundError('Estabelecimento');

      await repository.atualizar(id, { status: 'ARCHIVED' });
      await auditar(ator, 'establishment.archive', 'Establishment', id);
      await revalidarSlug(atual.slug);

      return this.porId(id);
    },

    async verificar(
      id: string,
      entrada: {
        status: string;
        por?: string | null;
        nota?: string | null;
        confirmarPagamentos: boolean;
      },
      ator: UsuarioAutenticado,
    ) {
      const atual = await repository.porId(id);
      if (!atual) throw new NotFoundError('Estabelecimento');

      const status = verificacaoParaBanco[entrada.status as keyof typeof verificacaoParaBanco];
      const agora = new Date();
      const verificado = status === 'VERIFIED';

      await repository.atualizar(id, {
        verificationStatus: status,
        verifiedAt: verificado ? agora : null,
        verifiedBy: verificado ? (entrada.por ?? ator.nome) : null,
        verificationNote: entrada.nota ?? null,
      });

      if (verificado && entrada.confirmarPagamentos) {
        await repository.confirmarPagamentos(id, agora);
      }

      await auditar(ator, 'establishment.verify', 'Establishment', id, { status: entrada.status });

      if (atual.status === 'PUBLISHED') await revalidarSlug(atual.slug);

      return this.porId(id);
    },

    async listarSugestoes(filtros: { status: string; page: number; perPage: number }) {
      const mapa = {
        pendente: 'PENDING',
        aprovada: 'APPROVED',
        rejeitada: 'REJECTED',
        spam: 'SPAM',
      } as const;

      const { registros, total } = await repository.listarSugestoes({
        status: mapa[filtros.status as keyof typeof mapa],
        page: filtros.page,
        perPage: filtros.perPage,
      });

      return {
        data: registros.map((sugestao) => ({
          id: sugestao.id,
          tipo: tiposSugestao[sugestao.type],
          status: statusSugestaoPublico[sugestao.status],
          dados: sugestao.payload,
          mensagem: sugestao.message,
          remetente: { nome: sugestao.submitterName, email: sugestao.submitterEmail },
          estabelecimento: sugestao.establishment
            ? { slug: sugestao.establishment.slug, nome: sugestao.establishment.name }
            : null,
          criadaEm: sugestao.createdAt.toISOString(),
        })),
        meta: {
          page: filtros.page,
          perPage: filtros.perPage,
          total,
          totalPages: Math.max(1, Math.ceil(total / filtros.perPage)),
        },
      };
    },

    /**
     * Aprovar uma sugestao de novo local cria um RASCUNHO, nunca um registro
     * publicado: quem publica e um humano, depois de conferir.
     */
    async aprovarSugestao(id: string, nota: string | null | undefined, ator: UsuarioAutenticado) {
      const sugestao = await repository.sugestaoPorId(id);
      if (!sugestao) throw new NotFoundError('Sugestao');
      if (sugestao.status !== 'PENDING') {
        throw new ConflictError('Esta sugestao ja foi moderada');
      }

      let estabelecimentoId = sugestao.establishmentId;

      if (sugestao.type === 'NEW_PLACE') {
        const dados = (sugestao.payload ?? {}) as {
          nome?: string;
          bairro?: string;
          categoria?: string;
          criptos?: string[];
          metodos?: string[];
        };

        if (!dados.nome) {
          throw new ValidationError('Sugestao sem nome nao pode virar cadastro');
        }

        const slug = await slugDisponivel(dados.nome, repository.slugExiste);

        const criado = await repository.criar({
          slug,
          name: dados.nome,
          neighborhood: dados.bairro ?? 'Nao informado',
          category:
            categoriaParaBanco[(dados.categoria ?? 'outro') as keyof typeof categoriaParaBanco] ??
            'OTHER',
          status: 'DRAFT',
          verificationStatus: 'COMMUNITY_REPORTED',
          verificationNote: 'Criado a partir de sugestao da comunidade',
        });

        estabelecimentoId = criado.id;

        // Cada par cripto x metodo informado vira uma forma de pagamento sem
        // data de confirmacao: veio da comunidade, ninguem confirmou ainda.
        const pagamentos = await pagamentosParaBanco(
          (dados.criptos ?? []).flatMap((cripto) =>
            (dados.metodos ?? ['outro']).map((metodo) => ({
              cripto,
              metodo: metodo as EntradaPagamento['metodo'],
              custodia: 'nao-informado' as const,
            })),
          ),
        );

        await repository.substituirPagamentos(criado.id, pagamentos);
      }

      await repository.atualizarSugestao(id, {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedById: ator.id,
        reviewNote: nota ?? null,
        establishmentId: estabelecimentoId,
      });

      await auditar(ator, 'suggestion.approve', 'Suggestion', id, { estabelecimentoId });

      return { id, status: 'aprovada' as const, estabelecimentoId };
    },

    async rejeitarSugestao(
      id: string,
      nota: string | null | undefined,
      spam: boolean,
      ator: UsuarioAutenticado,
    ) {
      const sugestao = await repository.sugestaoPorId(id);
      if (!sugestao) throw new NotFoundError('Sugestao');
      if (sugestao.status !== 'PENDING') {
        throw new ConflictError('Esta sugestao ja foi moderada');
      }

      await repository.atualizarSugestao(id, {
        status: spam ? 'SPAM' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: ator.id,
        reviewNote: nota ?? null,
      });

      await auditar(ator, spam ? 'suggestion.spam' : 'suggestion.reject', 'Suggestion', id);

      return { id, status: spam ? ('spam' as const) : ('rejeitada' as const) };
    },
  };
}

export type AdminService = ReturnType<typeof criarAdminService>;

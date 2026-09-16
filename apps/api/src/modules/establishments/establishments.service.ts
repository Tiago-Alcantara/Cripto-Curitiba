import type { Estabelecimento, ListaEstabelecimentos } from '@cripto/shared';
import { NotFoundError } from '../../shared/errors.js';
import { apresentarCompleto, apresentarResumo } from './establishments.presenter.js';
import type { EstablishmentsRepository, FiltrosNormalizados } from './establishments.repository.js';

export function criarEstablishmentsService(repository: EstablishmentsRepository) {
  return {
    async listar(filtros: FiltrosNormalizados): Promise<ListaEstabelecimentos> {
      const { registros, total } = await repository.listar(filtros);

      return {
        data: registros.map(apresentarResumo),
        meta: {
          page: filtros.page,
          perPage: filtros.perPage,
          total,
          totalPages: Math.max(1, Math.ceil(total / filtros.perPage)),
        },
      };
    },

    async buscarPorSlug(slug: string): Promise<Estabelecimento> {
      const registro = await repository.buscarPorSlug(slug);

      if (!registro) {
        throw new NotFoundError('Estabelecimento');
      }

      return apresentarCompleto(registro);
    },

    listarBairros() {
      return repository.listarBairros();
    },

    listarSlugsPublicados() {
      return repository.listarSlugsPublicados();
    },
  };
}

export type EstablishmentsService = ReturnType<typeof criarEstablishmentsService>;

import {
  criarEstabelecimentoSchema,
  editarEstabelecimentoSchema,
  erroSchema,
  estabelecimentoAdminSchema,
  filtrosAdminSchema,
  filtrosSugestoesSchema,
  listaAdminSchema,
  listaSugestoesSchema,
  moderarSugestaoSchema,
  resultadoModeracaoSchema,
  verificarSchema,
} from '@cripto/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { revalidarFrontend } from '../../shared/revalidate.js';
import { criarAdminRepository } from './admin.repository.js';
import { criarAdminService } from './admin.service.js';

const idSchema = z.object({ id: z.string().min(1) });

export async function adminRoutes(app: FastifyInstance) {
  const service = criarAdminService({
    repository: criarAdminRepository(app.prisma),
    revalidar: (tags) =>
      revalidarFrontend(tags, {
        frontendUrl: app.config.FRONTEND_URL,
        secret: app.config.REVALIDATE_SECRET,
        logger: app.log,
      }),
  });

  const rotas = app.withTypeProvider<ZodTypeProvider>();

  // Toda rota daqui para baixo exige Bearer valido.
  rotas.addHook('preHandler', app.exigirAdmin);

  rotas.get(
    '/admin/estabelecimentos',
    {
      schema: {
        querystring: filtrosAdminSchema,
        response: { 200: listaAdminSchema, 401: erroSchema },
      },
    },
    async (request) => service.listar(request.query),
  );

  rotas.get(
    '/admin/estabelecimentos/:id',
    {
      schema: {
        params: idSchema,
        response: { 200: estabelecimentoAdminSchema, 401: erroSchema, 404: erroSchema },
      },
    },
    async (request) => service.porId(request.params.id),
  );

  rotas.post(
    '/admin/estabelecimentos',
    {
      schema: {
        body: criarEstabelecimentoSchema,
        response: {
          201: estabelecimentoAdminSchema,
          400: erroSchema,
          401: erroSchema,
          409: erroSchema,
        },
      },
    },
    async (request, reply) => {
      const criado = await service.criar(request.body, request.user);
      return reply.status(201).send(criado);
    },
  );

  rotas.patch(
    '/admin/estabelecimentos/:id',
    {
      schema: {
        params: idSchema,
        body: editarEstabelecimentoSchema,
        response: {
          200: estabelecimentoAdminSchema,
          400: erroSchema,
          401: erroSchema,
          404: erroSchema,
          409: erroSchema,
        },
      },
    },
    async (request) => service.editar(request.params.id, request.body, request.user),
  );

  rotas.post(
    '/admin/estabelecimentos/:id/publicar',
    {
      schema: {
        params: idSchema,
        response: { 200: estabelecimentoAdminSchema, 401: erroSchema, 404: erroSchema },
      },
    },
    async (request) => service.publicar(request.params.id, request.user),
  );

  rotas.post(
    '/admin/estabelecimentos/:id/arquivar',
    {
      schema: {
        params: idSchema,
        response: { 200: estabelecimentoAdminSchema, 401: erroSchema, 404: erroSchema },
      },
    },
    async (request) => service.arquivar(request.params.id, request.user),
  );

  rotas.post(
    '/admin/estabelecimentos/:id/verificar',
    {
      schema: {
        params: idSchema,
        body: verificarSchema,
        response: {
          200: estabelecimentoAdminSchema,
          400: erroSchema,
          401: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request) => service.verificar(request.params.id, request.body, request.user),
  );

  rotas.get(
    '/admin/sugestoes',
    {
      schema: {
        querystring: filtrosSugestoesSchema,
        response: { 200: listaSugestoesSchema, 401: erroSchema },
      },
    },
    async (request) => service.listarSugestoes(request.query),
  );

  rotas.post(
    '/admin/sugestoes/:id/aprovar',
    {
      schema: {
        params: idSchema,
        body: moderarSugestaoSchema,
        response: {
          200: resultadoModeracaoSchema,
          401: erroSchema,
          404: erroSchema,
          409: erroSchema,
        },
      },
    },
    async (request) => service.aprovarSugestao(request.params.id, request.body.nota, request.user),
  );

  rotas.post(
    '/admin/sugestoes/:id/rejeitar',
    {
      schema: {
        params: idSchema,
        body: moderarSugestaoSchema.extend({ spam: z.boolean().default(false) }),
        response: {
          200: resultadoModeracaoSchema,
          401: erroSchema,
          404: erroSchema,
          409: erroSchema,
        },
      },
    },
    async (request) =>
      service.rejeitarSugestao(
        request.params.id,
        request.body.nota,
        request.body.spam,
        request.user,
      ),
  );
}

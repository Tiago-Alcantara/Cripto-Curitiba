import {
  bairroSchema,
  erroSchema,
  estabelecimentoSchema,
  filtrosEstabelecimentosSchema,
  listaEstabelecimentosSchema,
} from '@cripto/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { criarEstablishmentsRepository } from './establishments.repository.js';
import { criarEstablishmentsService } from './establishments.service.js';

export async function establishmentsRoutes(app: FastifyInstance) {
  const service = criarEstablishmentsService(criarEstablishmentsRepository(app.prisma));
  const rotas = app.withTypeProvider<ZodTypeProvider>();

  // Leitura publica: cacheavel na borda, o conteudo muda poucas vezes por semana.
  const cachePublico = 'public, s-maxage=300, stale-while-revalidate=3600';

  rotas.get(
    '/estabelecimentos',
    {
      schema: {
        querystring: filtrosEstabelecimentosSchema,
        response: { 200: listaEstabelecimentosSchema, 400: erroSchema },
      },
    },
    async (request, reply) => {
      reply.header('cache-control', cachePublico);
      return service.listar(request.query);
    },
  );

  rotas.get(
    '/estabelecimentos/:slug',
    {
      schema: {
        params: z.object({ slug: z.string().min(1) }),
        response: { 200: estabelecimentoSchema, 404: erroSchema },
      },
    },
    async (request, reply) => {
      reply.header('cache-control', cachePublico);
      return service.buscarPorSlug(request.params.slug);
    },
  );

  rotas.get(
    '/bairros',
    { schema: { response: { 200: z.array(bairroSchema) } } },
    async (_request, reply) => {
      reply.header('cache-control', cachePublico);
      return service.listarBairros();
    },
  );

  // Alimenta generateStaticParams e sitemap.xml do frontend.
  rotas.get(
    '/estabelecimentos-publicados',
    {
      schema: {
        response: { 200: z.array(z.object({ slug: z.string(), atualizadoEm: z.string() })) },
      },
    },
    async (_request, reply) => {
      reply.header('cache-control', cachePublico);
      const registros = await service.listarSlugsPublicados();
      return registros.map((r) => ({ slug: r.slug, atualizadoEm: r.updatedAt.toISOString() }));
    },
  );
}

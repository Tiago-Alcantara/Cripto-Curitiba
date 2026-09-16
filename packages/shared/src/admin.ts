import { z } from 'zod';
import { categoriaSchema, custodiaSchema, metodoSchema, verificacaoSchema } from './enums.js';
import { estabelecimentoSchema, horariosSchema, metaPaginacaoSchema } from './establishments.js';
import { tipoSugestaoSchema } from './suggestions.js';

export const statusPublicacaoSchema = z.enum(['rascunho', 'publicado', 'arquivado']);

export const statusPublicacao = {
  DRAFT: 'rascunho',
  PUBLISHED: 'publicado',
  ARCHIVED: 'arquivado',
} as const;

export const statusPublicacaoParaBanco = {
  rascunho: 'DRAFT',
  publicado: 'PUBLISHED',
  arquivado: 'ARCHIVED',
} as const;

export const pagamentoAdminSchema = z.object({
  cripto: z.string().min(2).max(12),
  metodo: metodoSchema,
  rede: z.string().max(40).nullish(),
  custodia: custodiaSchema.default('nao-informado'),
  observacao: z.string().max(200).nullish(),
  confirmadoEm: z.iso.datetime().nullish(),
});

export const estabelecimentoAdminBaseSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug deve ser minusculo, sem acento, separado por hifen')
    .max(140)
    .optional(),
  descricao: z.string().max(4000).nullish(),
  categoria: categoriaSchema,
  faixaPreco: z.number().int().min(1).max(4).nullish(),

  rua: z.string().max(160).nullish(),
  numero: z.string().max(20).nullish(),
  complemento: z.string().max(80).nullish(),
  bairro: z.string().trim().min(2).max(80),
  cep: z.string().max(12).nullish(),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),

  telefone: z.string().max(40).nullish(),
  whatsapp: z.string().max(40).nullish(),
  email: z.string().max(160).nullish(),
  site: z.string().max(240).nullish(),
  instagram: z.string().max(160).nullish(),
  googleMaps: z.string().max(400).nullish(),
  cardapio: z.string().max(400).nullish(),

  horarios: horariosSchema.nullish(),
  pagamentos: z.array(pagamentoAdminSchema).max(30).default([]),
});

export const criarEstabelecimentoSchema = estabelecimentoAdminBaseSchema;
export const editarEstabelecimentoSchema = estabelecimentoAdminBaseSchema.partial();

export const verificarSchema = z.object({
  status: verificacaoSchema,
  por: z.string().max(80).nullish(),
  nota: z.string().max(400).nullish(),
  /** Marca a data de confirmacao em todas as formas de pagamento. */
  confirmarPagamentos: z.boolean().default(true),
});

export const moderarSugestaoSchema = z.object({
  nota: z.string().max(400).nullish(),
});

export const filtrosAdminSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: statusPublicacaoSchema.optional(),
  verificacao: verificacaoSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export const filtrosSugestoesSchema = z.object({
  status: z.enum(['pendente', 'aprovada', 'rejeitada', 'spam']).default('pendente'),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export type PagamentoAdmin = z.infer<typeof pagamentoAdminSchema>;
export type CriarEstabelecimento = z.input<typeof criarEstabelecimentoSchema>;
export type EditarEstabelecimento = z.input<typeof editarEstabelecimentoSchema>;
export type StatusPublicacao = z.infer<typeof statusPublicacaoSchema>;

// ---------- Respostas do painel ----------

export const estabelecimentoAdminSchema = estabelecimentoSchema.extend({
  status: statusPublicacaoSchema,
});

export const listaAdminSchema = z.object({
  data: z.array(estabelecimentoAdminSchema),
  meta: metaPaginacaoSchema,
});

export const statusSugestaoSchema = z.enum(['pendente', 'aprovada', 'rejeitada', 'spam']);

export const sugestaoAdminSchema = z.object({
  id: z.string(),
  tipo: tipoSugestaoSchema,
  status: statusSugestaoSchema,
  dados: z.unknown(),
  mensagem: z.string().nullable(),
  remetente: z.object({ nome: z.string().nullable(), email: z.string().nullable() }),
  estabelecimento: z.object({ slug: z.string(), nome: z.string() }).nullable(),
  criadaEm: z.string(),
});

export const listaSugestoesSchema = z.object({
  data: z.array(sugestaoAdminSchema),
  meta: metaPaginacaoSchema,
});

export const resultadoModeracaoSchema = z.object({
  id: z.string(),
  status: statusSugestaoSchema,
  estabelecimentoId: z.string().nullable().optional(),
});

export type EstabelecimentoAdmin = z.infer<typeof estabelecimentoAdminSchema>;
export type SugestaoAdmin = z.infer<typeof sugestaoAdminSchema>;
export type StatusSugestao = z.infer<typeof statusSugestaoSchema>;

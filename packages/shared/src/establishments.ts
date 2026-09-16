import { z } from 'zod';
import { categoriaSchema, custodiaSchema, metodoSchema, verificacaoSchema } from './enums.js';

/** Horario: [] = fechado; ausente/null = sem informacao (a UI distingue os dois). */
export const horarioDiaSchema = z
  .array(z.object({ open: z.string(), close: z.string() }))
  .nullable();

export const horariosSchema = z.object({
  mon: horarioDiaSchema.optional(),
  tue: horarioDiaSchema.optional(),
  wed: horarioDiaSchema.optional(),
  thu: horarioDiaSchema.optional(),
  fri: horarioDiaSchema.optional(),
  sat: horarioDiaSchema.optional(),
  sun: horarioDiaSchema.optional(),
});

export const pagamentoSchema = z.object({
  cripto: z.string(),
  criptoNome: z.string(),
  metodo: metodoSchema,
  rede: z.string().nullable(),
  custodia: custodiaSchema,
  observacao: z.string().nullable(),
  confirmadoEm: z.string().nullable(),
});

export const verificacaoInfoSchema = z.object({
  status: verificacaoSchema,
  em: z.string().nullable(),
  por: z.string().nullable(),
  nota: z.string().nullable(),
});

export const estabelecimentoResumoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nome: z.string(),
  categoria: categoriaSchema,
  bairro: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  fotoCapa: z.string().nullable(),
  faixaPreco: z.number().nullable(),
  verificacao: verificacaoInfoSchema,
  pagamentos: z.array(pagamentoSchema),
});

export const fotoSchema = z.object({
  url: z.string(),
  alt: z.string().nullable(),
  capa: z.boolean(),
});

export const estabelecimentoSchema = estabelecimentoResumoSchema.extend({
  descricao: z.string().nullable(),
  endereco: z.object({
    rua: z.string().nullable(),
    numero: z.string().nullable(),
    complemento: z.string().nullable(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string(),
    cep: z.string().nullable(),
  }),
  contato: z.object({
    telefone: z.string().nullable(),
    whatsapp: z.string().nullable(),
    email: z.string().nullable(),
    site: z.string().nullable(),
    instagram: z.string().nullable(),
    googleMaps: z.string().nullable(),
    cardapio: z.string().nullable(),
  }),
  horarios: horariosSchema.nullable(),
  fotos: z.array(fotoSchema),
  atualizadoEm: z.string(),
});

export const metaPaginacaoSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const listaEstabelecimentosSchema = z.object({
  data: z.array(estabelecimentoResumoSchema),
  meta: metaPaginacaoSchema,
});

export const ordenacaoSchema = z.enum(['recentes', 'nome', 'verificados']);

/** Aceita `?cripto=BTC&cripto=USDT` e `?cripto=BTC,USDT`. */
const listaCsv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((valor) => {
    if (valor === undefined) return undefined;
    const itens = (Array.isArray(valor) ? valor : [valor])
      .flatMap((v) => v.split(','))
      .map((v) => v.trim())
      .filter(Boolean);
    return itens.length > 0 ? itens : undefined;
  });

export const filtrosEstabelecimentosSchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  bairro: listaCsv,
  categoria: listaCsv,
  cripto: listaCsv,
  metodo: listaCsv,
  verificacao: verificacaoSchema.optional(),
  bbox: z
    .string()
    .regex(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/, 'bbox deve ser minLng,minLat,maxLng,maxLat')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(24),
  ordenar: ordenacaoSchema.default('recentes'),
});

export const criptoSchema = z.object({
  symbol: z.string(),
  nome: z.string(),
  iconUrl: z.string().nullable(),
  totalEstabelecimentos: z.number(),
});

export const bairroSchema = z.object({
  bairro: z.string(),
  totalEstabelecimentos: z.number(),
});

export type Pagamento = z.infer<typeof pagamentoSchema>;
export type EstabelecimentoResumo = z.infer<typeof estabelecimentoResumoSchema>;
export type Estabelecimento = z.infer<typeof estabelecimentoSchema>;
export type ListaEstabelecimentos = z.infer<typeof listaEstabelecimentosSchema>;
export type FiltrosEstabelecimentos = z.input<typeof filtrosEstabelecimentosSchema>;
/** Filtros ja validados e com defaults aplicados - o que o repository recebe. */
export type FiltrosResolvidos = z.output<typeof filtrosEstabelecimentosSchema>;
export type Cripto = z.infer<typeof criptoSchema>;
export type Bairro = z.infer<typeof bairroSchema>;
export type Horarios = z.infer<typeof horariosSchema>;

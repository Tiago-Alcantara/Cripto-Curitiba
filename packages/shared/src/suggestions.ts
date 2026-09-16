import { z } from 'zod';
import { categoriaSchema, metodoSchema } from './enums.js';

export const tiposSugestao = {
  NEW_PLACE: 'novo_local',
  UPDATE: 'atualizacao',
  ERROR_REPORT: 'reporte_erro',
} as const;

export const tipoSugestaoSchema = z.enum(['novo_local', 'atualizacao', 'reporte_erro']);

export const dadosSugestaoSchema = z.object({
  nome: z.string().trim().min(2).max(120).optional(),
  bairro: z.string().trim().max(80).optional(),
  endereco: z.string().trim().max(200).optional(),
  categoria: categoriaSchema.optional(),
  criptos: z.array(z.string().trim().max(12)).max(10).optional(),
  metodos: z.array(metodoSchema).max(10).optional(),
  contato: z.string().trim().max(120).optional(),
  site: z.string().trim().max(200).optional(),
});

export const novaSugestaoSchema = z
  .object({
    tipo: tipoSugestaoSchema,
    estabelecimentoId: z.string().trim().min(1).nullish(),
    dados: dadosSugestaoSchema.default({}),
    mensagem: z.string().trim().max(2000).optional(),
    remetente: z
      .object({
        nome: z.string().trim().max(80).optional(),
        email: z.email().max(160).optional(),
      })
      .default({}),
    turnstileToken: z.string().max(4096).optional(),
    // Honeypot: bots preenchem, humanos nao veem o campo.
    website: z.string().max(0).optional(),
  })
  .refine((v) => v.tipo === 'novo_local' || Boolean(v.estabelecimentoId), {
    message: 'estabelecimentoId e obrigatorio para atualizacao e reporte de erro',
    path: ['estabelecimentoId'],
  })
  .refine((v) => v.tipo !== 'novo_local' || Boolean(v.dados?.nome), {
    message: 'nome do local e obrigatorio para novo local',
    path: ['dados', 'nome'],
  });

export const sugestaoCriadaSchema = z.object({
  id: z.string(),
  status: z.literal('pendente'),
});

export type NovaSugestao = z.input<typeof novaSugestaoSchema>;
export type DadosSugestao = z.infer<typeof dadosSugestaoSchema>;

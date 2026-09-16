import { z } from 'zod';

export const codigosErro = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;

export const erroSchema = z.object({
  error: z.object({
    code: z.enum(codigosErro),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

export type CodigoErro = (typeof codigosErro)[number];
export type RespostaErro = z.infer<typeof erroSchema>;

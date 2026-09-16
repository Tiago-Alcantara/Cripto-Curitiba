import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().default(3333),
  DATABASE_URL: z.string().min(1),
  /** Origens permitidas no CORS. Aceita regex simples com `*` para previews da Vercel. */
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  /** URL do frontend de producao: alvo da revalidacao do ISR. */
  FRONTEND_URL: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  UPLOADS_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOADS_URL: z.string().default('http://localhost:3333/uploads'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const problemas = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variaveis de ambiente invalidas:\n${problemas}`);
  }

  return parsed.data;
}

/** Transforma `CORS_ORIGINS` em matchers, suportando `https://app-*.vercel.app`. */
export function parseCorsOrigins(value: string): (RegExp | string)[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      if (!origin.includes('*')) return origin;
      const escaped = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]*');
      return new RegExp(`^${escaped}$`);
    });
}

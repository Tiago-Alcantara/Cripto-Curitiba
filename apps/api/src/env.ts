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

  const env = parsed.data;

  // Em producao a checagem e mais dura: o que so aparece na primeira tentativa
  // de login (JWT_SECRET) tem que derrubar o boot, com o nome da variavel na
  // mensagem, em vez de estourar la dentro do registro de plugin.
  if (env.NODE_ENV === 'production') {
    const faltando: string[] = [];

    if (!env.JWT_SECRET) {
      faltando.push(
        '  - JWT_SECRET: obrigatoria (32+ caracteres). Gere com: openssl rand -base64 32',
      );
    }

    if (faltando.length > 0) {
      throw new Error(`Variaveis de ambiente faltando em producao:\n${faltando.join('\n')}`);
    }
  }

  return env;
}

/**
 * Avisos de configuracao incompleta que nao impedem a API de subir, mas
 * desligam funcionalidade em silencio — o tipo de coisa que so se descobre
 * quando alguem publica um estabelecimento e o site nao atualiza.
 */
export function avisosDeConfiguracao(env: Env): string[] {
  const avisos: string[] = [];

  if (env.NODE_ENV !== 'production') return avisos;

  if (!env.FRONTEND_URL || !env.REVALIDATE_SECRET) {
    avisos.push(
      'revalidacao do ISR desligada: defina FRONTEND_URL e REVALIDATE_SECRET, ' +
        'senao o site so atualiza no proximo ciclo de cache (1h)',
    );
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    avisos.push(
      'TURNSTILE_SECRET_KEY ausente: o formulario de sugestao fica protegido ' +
        'apenas por honeypot e rate limit',
    );
  }

  return avisos;
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

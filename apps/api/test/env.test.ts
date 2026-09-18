import { describe, expect, it } from 'vitest';
import { avisosDeConfiguracao, loadEnv, parseCorsOrigins } from '../src/env.js';

/** Reproduz o teste de origem que o @fastify/cors faz com a lista. */
function permite(configuracao: string, origem: string): boolean {
  return parseCorsOrigins(configuracao).some((permitida) =>
    typeof permitida === 'string' ? permitida === origem : permitida.test(origem),
  );
}

const PRODUCAO = 'https://criptocuritiba-web-one.vercel.app';
const PREVIEWS = 'https://criptocuritiba-web-*.vercel.app';
const CONFIG = `http://localhost:3000,${PRODUCAO},${PREVIEWS}`;

describe('parseCorsOrigins', () => {
  it('libera a origem de producao', () => {
    expect(permite(CONFIG, PRODUCAO)).toBe(true);
  });

  it('libera o localhost do desenvolvimento', () => {
    expect(permite(CONFIG, 'http://localhost:3000')).toBe(true);
  });

  it('libera os preview deployments da Vercel', () => {
    expect(permite(CONFIG, 'https://criptocuritiba-web-git-main-tiago.vercel.app')).toBe(true);
    expect(permite(CONFIG, 'https://criptocuritiba-web-abc123.vercel.app')).toBe(true);
  });

  it('recusa outro projeto na vercel', () => {
    expect(permite(CONFIG, 'https://outro-projeto.vercel.app')).toBe(false);
  });

  // O curinga nao pode atravessar ponto, senao um dominio de terceiro com a
  // nossa URL no prefixo entraria: criptocuritiba-web-x.vercel.app.golpe.com
  it('recusa dominio de terceiro que usa a nossa URL como prefixo', () => {
    expect(permite(CONFIG, 'https://criptocuritiba-web-x.vercel.app.golpe.com')).toBe(false);
    expect(permite(CONFIG, 'https://criptocuritiba-web-a.b.vercel.app')).toBe(false);
  });

  it('recusa http onde se espera https', () => {
    expect(permite(CONFIG, 'http://criptocuritiba-web-one.vercel.app')).toBe(false);
  });

  it('ignora espacos e entradas vazias', () => {
    expect(permite(' http://localhost:3000 , ,', 'http://localhost:3000')).toBe(true);
  });
});

const BASE = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres!!',
};

describe('loadEnv em producao', () => {
  it('derruba o boot quando falta JWT_SECRET, dizendo o nome da variavel', () => {
    expect(() => loadEnv({ ...BASE, JWT_SECRET: undefined, NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('recusa JWT_SECRET curta demais', () => {
    expect(() => loadEnv({ ...BASE, JWT_SECRET: 'curta', NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('exige DATABASE_URL', () => {
    expect(() => loadEnv({ ...BASE, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });

  it('sobe fora de producao sem JWT_SECRET', () => {
    expect(() => loadEnv({ ...BASE, JWT_SECRET: undefined })).not.toThrow();
  });
});

describe('avisosDeConfiguracao', () => {
  it('avisa quando a revalidacao do ISR fica desligada em producao', () => {
    const env = loadEnv({ ...BASE, NODE_ENV: 'production' });

    expect(avisosDeConfiguracao(env).join(' ')).toMatch(/revalidacao do ISR/);
  });

  it('nao avisa sobre ISR quando as duas variaveis existem', () => {
    const env = loadEnv({
      ...BASE,
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://criptocuritiba-web-one.vercel.app',
      REVALIDATE_SECRET: 'segredo',
    });

    expect(avisosDeConfiguracao(env).join(' ')).not.toMatch(/revalidacao do ISR/);
  });

  it('fica quieto fora de producao', () => {
    expect(avisosDeConfiguracao(loadEnv(BASE))).toEqual([]);
  });
});

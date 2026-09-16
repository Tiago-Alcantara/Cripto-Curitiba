import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    include: ['test/**/*.test.ts'],
    hookTimeout: 60_000,
    testTimeout: 30_000,
    pool: 'forks',
    // Os testes de integracao compartilham o banco de teste: rodar em serie
    // evita que o reset de um derrube as fixtures do outro.
    fileParallelism: false,
  },
});

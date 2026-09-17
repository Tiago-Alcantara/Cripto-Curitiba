import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * `prisma generate` nao toca no banco — so `migrate` e `introspect` precisam da
 * connection string. Por isso a datasource so entra quando DATABASE_URL existe:
 * no build da imagem Docker ela nao existe (e nao deve existir), e o helper
 * `env()` do Prisma derruba o build quando a variavel falta.
 */
const url = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(url ? { datasource: { url } } : {}),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});

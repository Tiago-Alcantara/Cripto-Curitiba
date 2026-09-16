import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPackage = resolve(here, '../../../packages/db');

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://cripto:cripto@localhost:5432/criptocuritiba_test?schema=public';

/** Aplica as migrations no banco de teste antes da suite. */
export default function setup() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: dbPackage,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

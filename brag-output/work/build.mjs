import path from 'node:path';
import { build } from '/home/user/Cripto-Curitiba/node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/lib/main.js';

const web = '/home/user/Cripto-Curitiba/apps/web';
const stubs = path.resolve('stubs');
await build({
  entryPoints: ['render.tsx'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'render.cjs',
  jsx: 'automatic',
  nodePaths: [path.join(web, 'node_modules')],
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/server'],
  alias: {
    'next/link': path.join(stubs, 'link.tsx'),
    'next/image': path.join(stubs, 'image.tsx'),
    'next/navigation': path.join(stubs, 'navigation.ts'),
    '@/lib/api': path.join(stubs, 'api.ts'),
    '@cripto/shared': '/home/user/Cripto-Curitiba/packages/shared/src/index.ts',
  },
  plugins: [
    {
      name: 'arroba',
      setup(b) {
        b.onResolve({ filter: /^@\// }, async (args) => {
          if (args.path === '@/lib/api') return { path: path.join(stubs, 'api.ts') };
          return b.resolve(`./${args.path.slice(2)}`, { resolveDir: web, kind: args.kind });
        });
      },
    },
  ],
  logLevel: 'warning',
});

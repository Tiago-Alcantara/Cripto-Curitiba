import type { AdminRole, PrismaClient } from '@cripto/db';
import { hash, verify } from '@node-rs/argon2';
import { UnauthorizedError } from '../../shared/errors.js';

export type UsuarioAutenticado = {
  id: string;
  email: string;
  nome: string;
  papel: AdminRole;
};

type Dependencias = {
  prisma: PrismaClient;
  assinar: (payload: UsuarioAutenticado) => string;
};

export function criarAuthService({ prisma, assinar }: Dependencias) {
  return {
    async login(email: string, senha: string) {
      const usuario = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

      // Sempre gasta o mesmo tempo, exista o usuario ou nao: senao o tempo de
      // resposta entrega quais e-mails estao cadastrados.
      const hashParaComparar =
        usuario?.passwordHash ??
        '$argon2id$v=19$m=19456,t=2,p=1$c2FsZ2Fkb2ZhbHNvMTIzNA$3pCQeDp4Ol7HOwUZFT1E5w4JnO/hLQzGZBqBnF1mYRE';

      const senhaConfere = await verify(hashParaComparar, senha).catch(() => false);

      if (!usuario?.isActive || !senhaConfere) {
        throw new UnauthorizedError('E-mail ou senha invalidos');
      }

      await prisma.adminUser.update({
        where: { id: usuario.id },
        data: { lastLoginAt: new Date() },
      });

      const autenticado: UsuarioAutenticado = {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.name,
        papel: usuario.role,
      };

      return { token: assinar(autenticado), usuario: autenticado };
    },

    async criarUsuario(dados: { email: string; nome: string; senha: string; papel?: AdminRole }) {
      return prisma.adminUser.create({
        data: {
          email: dados.email.toLowerCase(),
          name: dados.nome,
          passwordHash: await hash(dados.senha),
          role: dados.papel ?? 'EDITOR',
        },
      });
    },
  };
}

export type AuthService = ReturnType<typeof criarAuthService>;

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash } from '@node-rs/argon2';
import type {
  Custody,
  EstablishmentCategory,
  PaymentMethod,
  PublicationStatus,
  VerificationStatus,
} from '../src/client/enums.js';
import { createPrismaClient } from '../src/prisma.js';

const here = dirname(fileURLToPath(import.meta.url));
const prisma = createPrismaClient();

type SeedPayment = {
  crypto: string;
  method: PaymentMethod;
  network?: string;
  custody?: Custody;
  note?: string;
};

type SeedEstablishment = {
  slug: string;
  name: string;
  description?: string;
  category: EstablishmentCategory;
  neighborhood: string;
  street?: string;
  number?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: number;
  status: PublicationStatus;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationNote?: string;
  openingHours?: unknown;
  payments: SeedPayment[];
};

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(join(here, 'seeds', file), 'utf8')) as T;
}

async function seedCryptos() {
  const cryptos =
    await readJson<{ symbol: string; name: string; sortOrder: number }[]>('cryptos.json');

  for (const crypto of cryptos) {
    await prisma.crypto.upsert({
      where: { symbol: crypto.symbol },
      create: crypto,
      update: { name: crypto.name, sortOrder: crypto.sortOrder },
    });
  }

  return cryptos.length;
}

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@criptocuritiba.local';
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    console.warn('! ADMIN_SEED_PASSWORD nao definida - admin nao criado');
    return null;
  }

  const passwordHash = await hash(password);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name: 'Admin', passwordHash, role: 'OWNER' },
    update: { passwordHash, isActive: true },
  });

  return admin.email;
}

async function seedEstablishments() {
  const establishments = await readJson<SeedEstablishment[]>('establishments.json');
  const cryptos = await prisma.crypto.findMany();
  const cryptoIdBySymbol = new Map(cryptos.map((c) => [c.symbol, c.id]));

  for (const { payments, openingHours, ...data } of establishments) {
    const establishment = await prisma.establishment.upsert({
      where: { slug: data.slug },
      create: {
        ...data,
        openingHours: (openingHours ?? undefined) as never,
        verifiedAt: data.verificationStatus === 'VERIFIED' ? new Date() : null,
      },
      update: {},
    });

    for (const payment of payments) {
      const cryptoId = cryptoIdBySymbol.get(payment.crypto);
      if (!cryptoId) {
        throw new Error(`Cripto ${payment.crypto} nao existe no catalogo (seed de ${data.slug})`);
      }

      await prisma.acceptedPayment.upsert({
        where: {
          establishmentId_cryptoId_method: {
            establishmentId: establishment.id,
            cryptoId,
            method: payment.method,
          },
        },
        create: {
          establishmentId: establishment.id,
          cryptoId,
          method: payment.method,
          network: payment.network ?? null,
          custody: payment.custody ?? 'UNKNOWN',
          note: payment.note ?? null,
          lastConfirmedAt: data.verificationStatus === 'VERIFIED' ? new Date() : null,
        },
        update: {},
      });
    }
  }

  return establishments.length;
}

async function main() {
  const cryptos = await seedCryptos();
  const admin = await seedAdmin();
  const establishments = await seedEstablishments();

  console.log(`seed: ${cryptos} criptos, ${establishments} estabelecimentos`);
  console.log(admin ? `seed: admin ${admin}` : 'seed: admin nao criado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

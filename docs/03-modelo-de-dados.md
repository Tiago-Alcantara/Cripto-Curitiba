# 03 — Modelo de dados

Rascunho do schema do módulo de estabelecimentos. Nomes de modelos/campos em
inglês, conteúdo e URLs públicas em português ([ADR-0008](adr/0008-idioma-do-codigo.md)).

## Entidades

| Entidade | Papel |
|---|---|
| `Establishment` | O local. Núcleo do módulo. |
| `Crypto` | Catálogo de moedas (BTC, USDT...). Tabela, não enum — admin cadastra sem migration. |
| `AcceptedPayment` | Ligação N:N `Establishment × Crypto` **com contexto**: rede/método, custódia, data da última confirmação. É aqui que mora o diferencial do produto. |
| `EstablishmentPhoto` | Fotos, com capa e ordem. |
| `Suggestion` | Sugestão/correção da comunidade, aguardando moderação. |
| `AdminUser` | Quem entra no painel. |
| `AuditLog` | Quem mudou o quê (leve, só no admin). |

Decisões relevantes:

- **`AcceptedPayment` é entidade própria, não um array de strings.** "Aceita BTC
  via Lightning, confirmado em 12/2025" é o dado que ninguém mais oferece; ele
  precisa de colunas próprias para ser filtrável e datável.
- **Sem PostGIS no MVP.** `latitude`/`longitude` como `Float` bastam para plotar e
  para um filtro por bounding box. Curitiba inteira cabe em poucos km²; distância
  real só vira necessidade se surgir "perto de mim" com ordenação.
- **`Suggestion` guarda um `payload Json`**, não campos espelhados. Sugestão é
  dado bruto de terceiro; só vira registro estruturado quando um humano aprova.
- **`status` (publicação) e `verificationStatus` (confiança) são independentes.**
  Um local pode estar publicado e reportado pela comunidade; outro, verificado mas
  ainda em rascunho.

## Rascunho do `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Módulo: establishments ----------

enum EstablishmentCategory {
  RESTAURANT
  CAFE
  BAR
  BAKERY
  FAST_FOOD
  MARKET
  STORE
  SERVICE
  OTHER
}

enum PublicationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED        // fechou ou parou de aceitar cripto
}

enum VerificationStatus {
  VERIFIED           // confirmado pela equipe (visita/contato), com data
  COMMUNITY_REPORTED // informado pela comunidade, ainda não checado
  UNVERIFIED
}

enum PaymentMethod {
  LIGHTNING
  ONCHAIN
  LIQUID
  EVM            // redes EVM (Polygon, BSC...) — detalhe em `network`
  TRON
  SOLANA
  OTHER
}

enum Custody {
  OWN_WALLET     // carteira própria do estabelecimento
  PROCESSOR      // gateway/processador
  EXCHANGE       // recebe via conta de exchange
  UNKNOWN
}

model Establishment {
  id          String   @id @default(cuid())
  slug        String   @unique              // "tartuferia-san-paulo"
  name        String
  description String?  @db.Text
  category    EstablishmentCategory
  priceRange  Int?                          // 1..4 ($ a $$$$)

  // endereço
  street       String?
  number       String?
  complement   String?
  neighborhood String                       // bairro — filtro de primeira classe
  city         String   @default("Curitiba")
  state        String   @default("PR")
  zipCode      String?
  latitude     Float?
  longitude    Float?

  // contato e links
  phone         String?
  whatsapp      String?
  email         String?
  website       String?
  instagram     String?
  googleMapsUrl String?
  menuUrl       String?

  openingHours Json?                        // ver formato abaixo

  status             PublicationStatus  @default(DRAFT)
  verificationStatus VerificationStatus @default(COMMUNITY_REPORTED)
  verifiedAt         DateTime?
  verifiedBy         String?                // nome/handle de quem verificou
  verificationNote   String?                // "confirmado por telefone com o gerente"

  acceptedPayments AcceptedPayment[]
  photos           EstablishmentPhoto[]
  suggestions      Suggestion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, verificationStatus])
  @@index([neighborhood])
  @@index([category])
  @@index([latitude, longitude])
}

model Crypto {
  id       String  @id @default(cuid())
  symbol   String  @unique     // "BTC"
  name     String              // "Bitcoin"
  iconUrl  String?
  sortOrder Int    @default(0)
  isActive Boolean @default(true)

  acceptedBy AcceptedPayment[]
}

model AcceptedPayment {
  id              String @id @default(cuid())
  establishmentId String
  cryptoId        String

  method  PaymentMethod
  network String?              // "Polygon", "Arbitrum" — livre, complementa EVM
  custody Custody @default(UNKNOWN)
  note    String?              // "aceita acima de R$ 50"

  lastConfirmedAt DateTime?    // recência POR forma de pagamento

  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  crypto        Crypto        @relation(fields: [cryptoId], references: [id])

  @@unique([establishmentId, cryptoId, method])
  @@index([cryptoId])
}

model EstablishmentPhoto {
  id              String  @id @default(cuid())
  establishmentId String
  url             String
  alt             String?
  isCover         Boolean @default(false)
  sortOrder       Int     @default(0)

  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)

  @@index([establishmentId])
}

// ---------- Módulo: suggestions ----------

enum SuggestionType {
  NEW_PLACE
  UPDATE
  ERROR_REPORT
}

enum SuggestionStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM
}

model Suggestion {
  id              String           @id @default(cuid())
  type            SuggestionType
  status          SuggestionStatus @default(PENDING)
  establishmentId String?                          // preenchido em UPDATE/ERROR_REPORT
  payload         Json                             // dados crus enviados
  message         String?          @db.Text

  submitterName  String?
  submitterEmail String?
  ipHash         String?                           // hash, não o IP — anti-spam sem guardar PII
  userAgent      String?

  reviewedAt   DateTime?
  reviewedById String?
  reviewNote   String?

  establishment Establishment? @relation(fields: [establishmentId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())

  @@index([status, createdAt])
}

// ---------- Módulo: auth/admin ----------

enum AdminRole {
  OWNER
  EDITOR
}

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         AdminRole @default(EDITOR)
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String            // "establishment.publish"
  entity    String            // "Establishment"
  entityId  String
  diff      Json?
  createdAt DateTime @default(now())

  @@index([entity, entityId])
}
```

## Formato de `openingHours`

```jsonc
{
  "mon": [{ "open": "11:30", "close": "15:00" }, { "open": "18:00", "close": "23:00" }],
  "tue": [{ "open": "11:30", "close": "23:00" }],
  "wed": [], // fechado
  "sun": null // sem informação  -> UI mostra "horário não informado"
}
```

Array vazio = fechado; `null`/ausente = desconhecido. A distinção importa: "não
sabemos" nunca deve ser exibido como "fechado".

## Seed

`packages/db/prisma/seed.ts` popula:

1. `Crypto`: BTC, USDT, ETH, USDC, SOL, BRL-stablecoins conforme necessário.
2. Um `AdminUser` OWNER (senha via `ADMIN_SEED_PASSWORD`, obrigatório trocar).
3. Estabelecimentos iniciais do levantamento manual — começando pela Tartuferia
   San Paulo — em `packages/db/prisma/seeds/establishments.json`, para que a
   curadoria possa ser feita em arquivo antes do painel existir.

## Convenções de migration

- Toda mudança de schema vira migration Prisma versionada (`prisma migrate dev`).
- Em produção, apenas `prisma migrate deploy` (nunca `db push`).
- Migration destrutiva (drop/rename de coluna com dado) só depois de backup
  manual confirmado — ver [06-infra-e-deploy](06-infra-e-deploy.md#backups).

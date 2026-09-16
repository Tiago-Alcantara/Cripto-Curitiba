-- CreateEnum
CREATE TYPE "EstablishmentCategory" AS ENUM ('RESTAURANT', 'CAFE', 'BAR', 'BAKERY', 'FAST_FOOD', 'MARKET', 'STORE', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'COMMUNITY_REPORTED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('LIGHTNING', 'ONCHAIN', 'LIQUID', 'EVM', 'TRON', 'SOLANA', 'OTHER');

-- CreateEnum
CREATE TYPE "Custody" AS ENUM ('OWN_WALLET', 'PROCESSOR', 'EXCHANGE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('NEW_PLACE', 'UPDATE', 'ERROR_REPORT');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateTable
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "EstablishmentCategory" NOT NULL,
    "priceRange" INTEGER,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Curitiba',
    "state" TEXT NOT NULL DEFAULT 'PR',
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "googleMapsUrl" TEXT,
    "menuUrl" TEXT,
    "openingHours" JSONB,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'COMMUNITY_REPORTED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crypto" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Crypto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcceptedPayment" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "cryptoId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "network" TEXT,
    "custody" "Custody" NOT NULL DEFAULT 'UNKNOWN',
    "note" TEXT,
    "lastConfirmedAt" TIMESTAMP(3),

    CONSTRAINT "AcceptedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstablishmentPhoto" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstablishmentPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "establishmentId" TEXT,
    "payload" JSONB NOT NULL,
    "message" TEXT,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Establishment_slug_key" ON "Establishment"("slug");

-- CreateIndex
CREATE INDEX "Establishment_status_verificationStatus_idx" ON "Establishment"("status", "verificationStatus");

-- CreateIndex
CREATE INDEX "Establishment_neighborhood_idx" ON "Establishment"("neighborhood");

-- CreateIndex
CREATE INDEX "Establishment_category_idx" ON "Establishment"("category");

-- CreateIndex
CREATE INDEX "Establishment_latitude_longitude_idx" ON "Establishment"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Crypto_symbol_key" ON "Crypto"("symbol");

-- CreateIndex
CREATE INDEX "AcceptedPayment_cryptoId_idx" ON "AcceptedPayment"("cryptoId");

-- CreateIndex
CREATE UNIQUE INDEX "AcceptedPayment_establishmentId_cryptoId_method_key" ON "AcceptedPayment"("establishmentId", "cryptoId", "method");

-- CreateIndex
CREATE INDEX "EstablishmentPhoto_establishmentId_idx" ON "EstablishmentPhoto"("establishmentId");

-- CreateIndex
CREATE INDEX "Suggestion_status_createdAt_idx" ON "Suggestion"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "AcceptedPayment" ADD CONSTRAINT "AcceptedPayment_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptedPayment" ADD CONSTRAINT "AcceptedPayment_cryptoId_fkey" FOREIGN KEY ("cryptoId") REFERENCES "Crypto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablishmentPhoto" ADD CONSTRAINT "EstablishmentPhoto_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

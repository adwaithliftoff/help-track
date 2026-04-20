/*
  Warnings:

  - You are about to drop the column `assetTag` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `locationOwner` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `macAddress` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `assets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "assets_assetTag_key";

-- DropIndex
DROP INDEX "assets_macAddress_key";

-- DropIndex
DROP INDEX "assets_serialNumber_key";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "assetTag",
DROP COLUMN "locationOwner",
DROP COLUMN "macAddress",
DROP COLUMN "serialNumber";

-- CreateTable
CREATE TABLE "physical_assets" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "assetTag" TEXT,

    CONSTRAINT "physical_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_subscriptions" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "planLicenseType" TEXT,
    "totalSeats" INTEGER,
    "renewalDate" TIMESTAMP(3),
    "accountOwner" TEXT,
    "licenseKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "physical_assets_assetId_key" ON "physical_assets"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "physical_assets_serialNumber_key" ON "physical_assets"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "physical_assets_macAddress_key" ON "physical_assets"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "physical_assets_assetTag_key" ON "physical_assets"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "digital_subscriptions_assetId_key" ON "digital_subscriptions"("assetId");

-- AddForeignKey
ALTER TABLE "physical_assets" ADD CONSTRAINT "physical_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_subscriptions" ADD CONSTRAINT "digital_subscriptions_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

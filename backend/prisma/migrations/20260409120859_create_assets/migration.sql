-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('INVENTORY', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETURNED', 'INACTIVE', 'LOST', 'RETIRED');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('HARDWARE', 'ACCESSORY', 'SOFTWARE', 'AI_SUBSCRIPTION', 'SAAS_TOOL', 'OTHER');

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "assetCategory" "AssetCategory" NOT NULL,
    "assetType" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "brandVendor" TEXT,
    "modelPlan" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'INVENTORY',
    "locationOwner" TEXT,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "assetTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_serialNumber_key" ON "assets"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "assets_macAddress_key" ON "assets"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "assets_assetTag_key" ON "assets"("assetTag");

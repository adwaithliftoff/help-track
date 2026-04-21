-- DropForeignKey
ALTER TABLE "digital_subscriptions" DROP CONSTRAINT "digital_subscriptions_assetId_fkey";

-- DropForeignKey
ALTER TABLE "physical_assets" DROP CONSTRAINT "physical_assets_assetId_fkey";

-- AddForeignKey
ALTER TABLE "physical_assets" ADD CONSTRAINT "physical_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_subscriptions" ADD CONSTRAINT "digital_subscriptions_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[clerkUserId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_clerkUserId_key" ON "Employee"("clerkUserId");

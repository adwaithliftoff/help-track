-- CreateEnum
CREATE TYPE "ReturnCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'DAMAGED');

-- CreateTable
CREATE TABLE "allocation_history" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "assignedEmployeeId" INTEGER NOT NULL,
    "allocationDate" TIMESTAMP(3) NOT NULL,
    "allocatedById" INTEGER,
    "returnDate" TIMESTAMP(3),
    "receivingAdminId" INTEGER,
    "returnCondition" "ReturnCondition",
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "allocation_history" ADD CONSTRAINT "allocation_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_history" ADD CONSTRAINT "allocation_history_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_history" ADD CONSTRAINT "allocation_history_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_history" ADD CONSTRAINT "allocation_history_receivingAdminId_fkey" FOREIGN KEY ("receivingAdminId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

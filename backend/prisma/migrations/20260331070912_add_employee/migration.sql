-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXITED');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "employeeNumber" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_officialEmail_key" ON "Employee"("officialEmail");

/*
  Warnings:

  - You are about to drop the column `department` on the `Employee` table. All the data in the column will be lost.
  - Made the column `departmentId` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/


INSERT INTO "Department" ("name")
SELECT DISTINCT "department" FROM "Employee"
WHERE "department" IS NOT NULL;

UPDATE "Employee" e
SET "departmentId" = d."id"
FROM "Department" d
WHERE e."department" = d."name";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department",
ALTER COLUMN "departmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

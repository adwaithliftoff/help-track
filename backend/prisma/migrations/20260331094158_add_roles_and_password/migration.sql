/*
  Warnings:

  - Added the required column `password` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "RoleName" NOT NULL DEFAULT 'EMPLOYEE';

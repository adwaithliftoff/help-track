-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'ASSET_CREATE', 'ASSET_READ', 'ASSET_UPDATE', 'ASSET_DELETE', 'ALLOCATION_CREATE', 'ALLOCATION_READ', 'ALLOCATION_UPDATE');

-- CreateTable
CREATE TABLE "RolePermission" (
    "role" "RoleName" NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role","permission")
);

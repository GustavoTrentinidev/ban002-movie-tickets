-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEFAULT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;
ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'DEFAULT';

-- Backfill demo users seeded in 20260411170000_seed_movies_rooms_sessions
-- Demo passwords (change in any non-local environment): eduardo -> "eduardo123", gustavo -> "gustavo123"
UPDATE "users" SET "password_hash" = '$2b$10$BIbVdcT8zmx3vySrCPlfe.2AsRDuD7AhsnMbC5/cbqS5N0xoN.bFu', "role" = 'DEFAULT' WHERE "username" = 'eduardo';
UPDATE "users" SET "password_hash" = '$2b$10$G0NTeiVqJuG5Xr83665pAekU9B1P96Kje///9eYU.e5bTzQ3JhF4K', "role" = 'ADMIN' WHERE "username" = 'gustavo';

-- Enforce NOT NULL now that every existing row has been backfilled
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

/*
  Warnings:

  - The values [AI,User,System] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('assistant', 'user', 'system', 'tool');
ALTER TABLE "public"."Message" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "Message" ALTER COLUMN "role" SET DEFAULT 'system';
COMMIT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "role" SET DEFAULT 'system';

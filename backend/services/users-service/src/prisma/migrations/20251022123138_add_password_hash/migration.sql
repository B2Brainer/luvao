/*
  Warnings:

  - You are about to drop the `Credential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Credential" DROP CONSTRAINT "Credential_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "public"."Credential";

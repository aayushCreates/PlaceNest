/*
  Warnings:

  - You are about to drop the column `mode` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Job` table. All the data in the column will be lost.
  - Added the required column `position` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedinUrl` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "mode";

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "role",
ADD COLUMN     "branchCutOff" "public"."Branch"[],
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "yearCutOff" "public"."Year"[];

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "linkedinUrl" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."ApplicationMode";

/*
  Warnings:

  - The values [CS] on the enum `Branch` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Branch_new" AS ENUM ('CSE', 'CY', 'IT', 'ME', 'ECE', 'EIC', 'EE', 'CE');
ALTER TABLE "User" ALTER COLUMN "branch" TYPE "Branch_new" USING ("branch"::text::"Branch_new");
ALTER TABLE "Job" ALTER COLUMN "branchCutOff" TYPE "Branch_new"[] USING ("branchCutOff"::text::"Branch_new"[]);
ALTER TYPE "Branch" RENAME TO "Branch_old";
ALTER TYPE "Branch_new" RENAME TO "Branch";
DROP TYPE "public"."Branch_old";
COMMIT;

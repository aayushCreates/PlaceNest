/*
  Warnings:

  - You are about to drop the column `package` on the `Job` table. All the data in the column will be lost.
  - Added the required column `salary` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "package",
ADD COLUMN     "salary" TEXT NOT NULL;

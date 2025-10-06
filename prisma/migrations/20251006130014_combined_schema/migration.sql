/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Coordinator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "activeBacklog" BOOLEAN,
ADD COLUMN     "aiFeedback" TEXT,
ADD COLUMN     "backlogs" INTEGER,
ADD COLUMN     "branch" "public"."Branch",
ADD COLUMN     "cgpa" DECIMAL(3,2),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "founded" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "lastAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "resumeScore" INTEGER,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "verificationStatus" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "year" "public"."Year";

-- DropTable
DROP TABLE "public"."Company";

-- DropTable
DROP TABLE "public"."Coordinator";

-- DropTable
DROP TABLE "public"."Student";

-- CreateTable
CREATE TABLE "public"."Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Verification_userId_verifiedById_idx" ON "public"."Verification"("userId", "verifiedById");

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

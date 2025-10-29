-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'SHORTLISTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPlaced" BOOLEAN,
ADD COLUMN     "placedCompany" TEXT;

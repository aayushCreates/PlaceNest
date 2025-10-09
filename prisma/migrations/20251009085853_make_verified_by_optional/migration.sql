-- AlterTable
ALTER TABLE "User" ALTER COLUMN "verifyById" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Verification" ALTER COLUMN "verifiedById" DROP NOT NULL;

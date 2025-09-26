/*
  Warnings:

  - You are about to drop the column `userId` on the `Application` table. All the data in the column will be lost.
  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `type` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `cgpa_cutoff` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `active_backlog` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `backlogs` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cgpa` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId,studentId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mode` on the `Application` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `founded` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedin` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cgpaCutOff` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ApplicationMode" AS ENUM ('OFFLINE', 'ONLINE');

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropIndex
DROP INDEX "public"."Application_jobId_userId_key";

-- DropIndex
DROP INDEX "public"."Job_deadline_idx";

-- DropIndex
DROP INDEX "public"."User_branch_year_idx";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "userId",
ADD COLUMN     "studentId" TEXT NOT NULL,
DROP COLUMN "mode",
ADD COLUMN     "mode" "public"."ApplicationMode" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "type",
DROP COLUMN "updateAt",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "founded" TEXT NOT NULL,
ADD COLUMN     "industry" TEXT NOT NULL,
ADD COLUMN     "linkedin" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "cgpa_cutoff",
ADD COLUMN     "cgpaCutOff" DECIMAL(3,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "active_backlog",
DROP COLUMN "backlogs",
DROP COLUMN "branch",
DROP COLUMN "cgpa",
DROP COLUMN "firstName",
DROP COLUMN "isVerified",
DROP COLUMN "lastName",
DROP COLUMN "resumeUrl",
DROP COLUMN "year",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."Application_Mode";

-- DropEnum
DROP TYPE "public"."Application_Status";

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "branch" "public"."Branch",
    "year" "public"."Year",
    "cgpa" DECIMAL(3,2),
    "activeBacklog" BOOLEAN,
    "backlogs" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coordinator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "branch" "public"."Branch",
    "year" "public"."Year",
    "cgpa" DECIMAL(3,2),
    "activeBacklog" BOOLEAN,
    "backlogs" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "public"."Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "public"."Student"("phone");

-- CreateIndex
CREATE INDEX "Student_branch_year_phone_email_idx" ON "public"."Student"("branch", "year", "phone", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_email_key" ON "public"."Coordinator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_phone_key" ON "public"."Coordinator"("phone");

-- CreateIndex
CREATE INDEX "Coordinator_branch_year_phone_email_idx" ON "public"."Coordinator"("branch", "year", "phone", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_studentId_key" ON "public"."Application"("jobId", "studentId");

-- CreateIndex
CREATE INDEX "Company_name_industry_email_idx" ON "public"."Company"("name", "industry", "email");

-- CreateIndex
CREATE INDEX "Job_status_deadline_companyId_idx" ON "public"."Job"("status", "deadline", "companyId");

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

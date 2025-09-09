/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `cgpaCutOff` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `eligibleBranches` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Coordinator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,userId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mode` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cgpa_cutoff` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Application_Status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."Branch" AS ENUM ('CS', 'CY', 'IT', 'ME', 'ECE', 'EIC', 'EE', 'CE');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('Internship', 'PartTime', 'FullTime', 'Contract');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'COORDINATOR', 'COMPANY');

-- CreateEnum
CREATE TYPE "public"."Year" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH');

-- CreateEnum
CREATE TYPE "public"."Application_Mode" AS ENUM ('OFFLINE', 'ONLINE');

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_studentId_fkey";

-- DropIndex
DROP INDEX "public"."Company_email_key";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "resumeUrl",
DROP COLUMN "studentId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mode" "public"."Application_Mode" NOT NULL,
ADD COLUMN     "status" "public"."Application_Status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "cgpaCutOff",
DROP COLUMN "eligibleBranches",
ADD COLUMN     "cgpa_cutoff" DECIMAL(3,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "package" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "status" "public"."JobStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "type" "public"."JobType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Coordinator";

-- DropTable
DROP TABLE "public"."Student";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "branch" "public"."Branch",
    "year" "public"."Year",
    "cgpa" DECIMAL(3,2),
    "active_backlog" BOOLEAN,
    "backlogs" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "User_branch_year_idx" ON "public"."User"("branch", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_userId_key" ON "public"."Application"("jobId", "userId");

-- CreateIndex
CREATE INDEX "Job_deadline_idx" ON "public"."Job"("deadline");

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

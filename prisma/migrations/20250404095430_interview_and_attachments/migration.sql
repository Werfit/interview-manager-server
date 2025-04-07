/*
  Warnings:

  - You are about to drop the column `name` on the `Interview` table. All the data in the column will be lost.
  - Added the required column `candidateId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Interview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `InterviewStatus` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('PDF', 'VIDEO');

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "name",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "InterviewStatus" ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "candidateId" TEXT,
    "interviewId" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_candidateId_key" ON "Attachment"("candidateId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

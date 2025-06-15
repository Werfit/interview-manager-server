/*
  Warnings:

  - You are about to drop the column `candidateId` on the `Attachment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CandidateCVStatus" AS ENUM ('UPLOADED', 'EMBEDDED');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_candidateId_fkey";

-- DropIndex
DROP INDEX "Attachment_candidateId_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "candidateId";

-- CreateTable
CREATE TABLE "CandidateCV" (
    "id" TEXT NOT NULL,
    "status" "CandidateCVStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,

    CONSTRAINT "CandidateCV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCV_candidateId_key" ON "CandidateCV"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCV_attachmentId_key" ON "CandidateCV"("attachmentId");

-- AddForeignKey
ALTER TABLE "CandidateCV" ADD CONSTRAINT "CandidateCV_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCV" ADD CONSTRAINT "CandidateCV_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

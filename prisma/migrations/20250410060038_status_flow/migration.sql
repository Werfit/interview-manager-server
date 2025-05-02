/*
  Warnings:

  - A unique constraint covering the columns `[nextStatusId]` on the table `InterviewStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InterviewStatus" ADD COLUMN     "nextStatusId" TEXT;

-- CreateTable
CREATE TABLE "InterviewStatusUpdate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromStatusId" TEXT NOT NULL,
    "toStatusId" TEXT NOT NULL,

    CONSTRAINT "InterviewStatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewStatusUpdate_fromStatusId_toStatusId_key" ON "InterviewStatusUpdate"("fromStatusId", "toStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewStatus_nextStatusId_key" ON "InterviewStatus"("nextStatusId");

-- AddForeignKey
ALTER TABLE "InterviewStatus" ADD CONSTRAINT "InterviewStatus_nextStatusId_fkey" FOREIGN KEY ("nextStatusId") REFERENCES "InterviewStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewStatusUpdate" ADD CONSTRAINT "InterviewStatusUpdate_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "InterviewStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewStatusUpdate" ADD CONSTRAINT "InterviewStatusUpdate_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "InterviewStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

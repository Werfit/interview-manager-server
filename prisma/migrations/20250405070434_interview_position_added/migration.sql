/*
  Warnings:

  - Added the required column `positionId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "positionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InterviewPosition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "InterviewPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewPosition_organizationId_name_key" ON "InterviewPosition"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "InterviewPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPosition" ADD CONSTRAINT "InterviewPosition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

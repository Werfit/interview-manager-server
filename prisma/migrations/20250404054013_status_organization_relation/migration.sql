/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `InterviewStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InterviewStatus" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InterviewStatus_organizationId_name_key" ON "InterviewStatus"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "InterviewStatus" ADD CONSTRAINT "InterviewStatus_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

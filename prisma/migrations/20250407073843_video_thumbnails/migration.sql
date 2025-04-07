/*
  Warnings:

  - A unique constraint covering the columns `[thumbnailId]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AttachmentType" ADD VALUE 'IMAGE';

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "thumbnailId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_thumbnailId_key" ON "Attachment"("thumbnailId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

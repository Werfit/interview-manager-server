/*
  Warnings:

  - You are about to drop the column `interviewId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `interviewId` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[recordingId]` on the table `Transcription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AttachmentType" ADD VALUE 'AUDIO';

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_thumbnailId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_recordingId_fkey";

-- DropIndex
DROP INDEX "Attachment_thumbnailId_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "interviewId",
DROP COLUMN "thumbnailId",
ADD COLUMN     "interviewRecordingAudioId" TEXT,
ADD COLUMN     "interviewRecordingId" TEXT,
ADD COLUMN     "interviewRecordingThumbnailId" TEXT;

-- AlterTable
ALTER TABLE "Transcription" DROP COLUMN "interviewId";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Participant";

-- DropEnum
DROP TYPE "ParticipantType";

-- CreateTable
CREATE TABLE "InterviewRecording" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "audioId" TEXT,
    "thumbnailId" TEXT NOT NULL,
    "transcriptionId" TEXT,

    CONSTRAINT "InterviewRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRecording_videoId_key" ON "InterviewRecording"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRecording_audioId_key" ON "InterviewRecording"("audioId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRecording_thumbnailId_key" ON "InterviewRecording"("thumbnailId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_recordingId_key" ON "Transcription"("recordingId");

-- AddForeignKey
ALTER TABLE "InterviewRecording" ADD CONSTRAINT "InterviewRecording_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewRecording" ADD CONSTRAINT "InterviewRecording_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewRecording" ADD CONSTRAINT "InterviewRecording_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewRecording" ADD CONSTRAINT "InterviewRecording_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "InterviewRecording"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

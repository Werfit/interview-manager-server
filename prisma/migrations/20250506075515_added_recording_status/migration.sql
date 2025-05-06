-- CreateEnum
CREATE TYPE "InterviewRecordingStatus" AS ENUM ('DEFAULT', 'EMBEDDED');

-- AlterTable
ALTER TABLE "InterviewRecording" ADD COLUMN     "status" "InterviewRecordingStatus" NOT NULL DEFAULT 'DEFAULT';

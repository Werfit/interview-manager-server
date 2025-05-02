-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Transcription" ADD COLUMN     "status" "TranscriptionStatus" NOT NULL DEFAULT 'PENDING';

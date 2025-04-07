-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING';

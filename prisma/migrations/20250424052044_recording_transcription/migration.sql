-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewId" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

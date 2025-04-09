import { mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

export class FileManager {
  readonly uploadPath = join(process.cwd(), 'uploads');
  readonly thumbnailPath = join(this.uploadPath, 'thumbnails');
  readonly pdfPath = join(this.uploadPath, 'pdf');

  getPDFFolder() {
    mkdirSync(this.pdfPath, { recursive: true });
    return this.pdfPath;
  }

  getChunkFolder(sessionId: string) {
    const uploadPath = this.getChunkFolderPath(sessionId);
    mkdirSync(uploadPath, { recursive: true });
    return uploadPath;
  }

  getChunkFolderPath(sessionId: string) {
    return join(this.uploadPath, sessionId);
  }

  getChunkFilename(chunkIndex: string, originalname: string) {
    return `chunk-${chunkIndex}${extname(originalname)}`;
  }

  getThumbnailFilename(sessionId: string) {
    return `${sessionId}.jpg`;
  }

  getRecordingFilename(sessionId: string) {
    return `${sessionId}.mp4`;
  }

  async fileExists(filepath: string) {
    try {
      await stat(filepath);
      return true;
    } catch {
      return false;
    }
  }
}

export const fileManager = new FileManager();

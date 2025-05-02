import { mkdirSync } from 'node:fs';
import {
  appendFile,
  readdir,
  readFile,
  stat,
  writeFile,
} from 'node:fs/promises';
import { extname, join } from 'node:path';

import { tryCatch } from '../utilities/try-catch/try-catch.utility';

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

  async getChunks(sessionId: string) {
    const uploadPath = this.getChunkFolderPath(sessionId);

    const [success, data] = await tryCatch(async () => {
      const chunks = await readdir(uploadPath);
      return chunks
        .filter((chunk) => chunk.startsWith('chunk-'))
        .sort((a, b) => {
          const indexA = this.extractIndexFromFilename(a);
          const indexB = this.extractIndexFromFilename(b);
          return indexA - indexB;
        });
    });

    if (!success) {
      return null;
    }

    return data;
  }

  async mergeChunks({
    sessionId,
    chunks,
  }: {
    chunks: string[];
    sessionId: string;
  }) {
    const mergedPath = join(this.uploadPath, `${sessionId}.webm`);
    await writeFile(mergedPath, Buffer.alloc(0));

    for (const chunk of chunks) {
      const chunkPath = join(this.getChunkFolderPath(sessionId), chunk);
      const buffer = await readFile(chunkPath);
      await appendFile(mergedPath, buffer);
    }

    return mergedPath;
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

  getAudioFilename(sessionId: string) {
    return `${sessionId}.aac`;
  }

  async fileExists(filepath: string) {
    try {
      await stat(filepath);
      return true;
    } catch {
      return false;
    }
  }

  private extractIndexFromFilename(f: string) {
    return Number.parseInt(f.match(/chunk-(\d+)/)?.[1] ?? '0');
  }
}

export const fileManager = new FileManager();

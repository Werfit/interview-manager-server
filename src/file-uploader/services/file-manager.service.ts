import { mkdirSync } from 'node:fs';
import {
  appendFile,
  readdir,
  readFile,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { QueueNames } from '../file-uploader.constants';
import { getUploadPath } from '../file-uploader.utility';
import { ThumbnailJobData } from '../processors/thumbnail.processor';
import { VideoJobData } from '../processors/video.processor';

const extractIndexFromFilename = (f: string) =>
  Number.parseInt(f.match(/chunk-(\d+)/)?.[1] ?? '0');

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);
  constructor(
    @InjectQueue(QueueNames.Thumbnail)
    private readonly thumbnailQueue: Queue<ThumbnailJobData>,
    @InjectQueue(QueueNames.Video)
    private readonly videoQueue: Queue<VideoJobData>,
  ) {}

  createChunkDirectory({ sessionId }: { sessionId: string }) {
    this.logger.log('FileManagerService::createChunkDirectory', sessionId);
    const uploadPath = join(getUploadPath(), sessionId);
    mkdirSync(uploadPath, { recursive: true });
    return uploadPath;
  }

  generateChunkFilename({
    chunkIndex,
    originalname,
    defaultExtension,
  }: {
    chunkIndex: string;
    originalname: string;
    defaultExtension?: string;
  }) {
    this.logger.log('FileManagerService::generateChunkFilename', {
      chunkIndex,
      originalname,
      defaultExtension,
    });
    return `chunk-${chunkIndex}${extname(originalname) || defaultExtension}`;
  }

  async getSessionChunks(sessionId: string) {
    this.logger.log('FileManagerService::getSessionChunks', sessionId);
    const uploadPath = join(getUploadPath(), sessionId);

    const [success, data] = await tryCatch(async () => {
      const chunks = await readdir(uploadPath);
      return chunks
        .filter((chunk) => chunk.startsWith('chunk-'))
        .sort((a, b) => {
          const indexA = extractIndexFromFilename(a);
          const indexB = extractIndexFromFilename(b);
          return indexA - indexB;
        });
    });

    if (!success) {
      throw new Error('Failed to get session chunks');
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
    this.logger.log('FileManagerService::mergeChunks', {
      sessionId,
    });
    const mergedPath = join(getUploadPath(), `${sessionId}.webm`);
    await writeFile(mergedPath, Buffer.alloc(0));

    for (const chunk of chunks) {
      const chunkPath = join(getUploadPath(), sessionId, chunk);
      const buffer = await readFile(chunkPath);
      await appendFile(mergedPath, buffer);
    }

    return mergedPath;
  }

  async cleanupSession({
    sessionId,
    videoPathname,
  }: {
    sessionId: string;
    videoPathname: string;
  }) {
    this.logger.log('FileManagerService::cleanupSession', {
      sessionId,
      videoPathname,
    });
    const uploadPath = join(getUploadPath(), sessionId);
    await rm(uploadPath, { recursive: true, force: true });
    await rm(videoPathname, { force: true });
  }

  async startThumbnailGeneration({
    filepath,
    videoId,
  }: {
    filepath: string;
    videoId: string;
  }) {
    this.logger.log('FileManagerService::startThumbnailGeneration', {
      filepath,
      videoId,
    });
    return this.thumbnailQueue.add(QueueNames.Thumbnail, {
      videoPath: filepath,
      videoId,
    });
  }

  async startVideoConversion({
    filepath,
    videoId,
  }: {
    filepath: string;
    videoId: string;
  }) {
    this.logger.log('FileManagerService::startVideoConversion', {
      filepath,
      videoId,
    });
    return this.videoQueue.add(QueueNames.Video, {
      videoPath: filepath,
      videoId,
    });
  }

  async deleteFile(filepath: string) {
    this.logger.log('FileManagerService::deleteFile', {
      filepath,
    });

    const sessionId = basename(filepath, extname(filepath));

    const thumbnailPath = join(
      getUploadPath(),
      'thumbnails',
      `${sessionId}.jpg`,
    );

    await rmdir(join(getUploadPath(), sessionId), { recursive: true });
    await rm(filepath, { force: true });
    await rm(thumbnailPath, { force: true });
  }
}

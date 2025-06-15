import { basename, extname } from 'node:path';

import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import * as ffmpeg from 'fluent-ffmpeg';

class MediaProcessor {
  convertVideoToMp4(videoPath: string, outputPath: string) {
    return new Promise<string>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (error) => {
          reject(error);
        })

        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-crf 23',
          '-c:a aac',
        ])
        .save(outputPath);
    });
  }

  extractAudioFromVideo(videoPath: string, outputPath: string) {
    return new Promise<string>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (error) => {
          reject(error);
        })
        .audioChannels(1)
        .audioFrequency(16_000)
        .audioCodec('pcm_s16le')
        .format('wav')
        .save(outputPath);
    });
  }

  extractThumbnailFromVideo(videoPath: string, outputPath: string) {
    return new Promise<string>((resolve, reject) => {
      const filename = basename(videoPath, extname(videoPath));

      ffmpeg(videoPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (error) => {
          reject(error);
        })
        .screenshots({
          timestamps: ['2'],
          filename: `${filename}.jpg`,
          folder: fileManager.thumbnailPath,
        });
    });
  }
}

export const mediaProcessor = new MediaProcessor();

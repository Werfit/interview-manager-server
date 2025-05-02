import { basename, extname } from 'node:path';

import * as ffmpeg from 'fluent-ffmpeg';
import { fileManager } from 'src/shared/helpers/file-manager.helper';

class MediaProcessor {
  convertVideoToMp4(videoPath: string, outputPath: string) {
    return new Promise<string>((resolve, reject) => {
      console.log('Converting video to mp4', { videoPath, outputPath });

      ffmpeg(videoPath)
        .on('progress', (progress) => {
          console.log('Progress', progress);
        })
        .on('end', () => {
          console.log('Video converted to mp4', outputPath);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('Failed to convert video to mp4', error);
          reject(error);
        })
        .on('start', () => {
          console.log('Starting conversion');
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
      console.log('Extracting audio from video', { videoPath, outputPath });

      ffmpeg(videoPath)
        .on('end', () => {
          console.log('Audio extracted from video', outputPath);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('Failed to extract audio from video', error);
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
          console.log('Thumbnail created at:', outputPath);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('Failed to generate thumbnail', error);
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

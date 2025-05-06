import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';

export const FileChunksInterceptor = (fieldName: string) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (request, _, callback) => {
        const body = request.body as { sessionId: string };

        try {
          const data = fileManager.getChunkFolder(body.sessionId);

          callback(null, data);
        } catch (error) {
          callback(error, '');
        }
      },
      filename: (request, file, callback) => {
        const body = request.body as { chunkIndex: string };
        const filename = fileManager.getChunkFilename(
          body.chunkIndex,
          file.originalname,
        );

        callback(null, filename);
      },
    }),
  });

import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileManagerService } from 'src/file-uploader/services/file-manager.service';

export function FileChunksInterceptor(
  fieldName: string,
  defaultExtension?: string,
): Type<NestInterceptor> {
  @Injectable()
  class FileChunksInterceptorMixin implements NestInterceptor {
    constructor(private readonly fileUploaderService: FileManagerService) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
      const interceptor = new (FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: (request, _, callback) => {
            const body = request.body as { sessionId: string };

            try {
              const data = this.fileUploaderService.createChunkDirectory({
                sessionId: body.sessionId,
              });

              callback(null, data);
            } catch (error) {
              callback(error, '');
            }
          },
          filename: (request, file, callback) => {
            const body = request.body as { chunkIndex: string };
            const filename = this.fileUploaderService.generateChunkFilename({
              chunkIndex: body.chunkIndex,
              originalname: file.originalname,
              defaultExtension,
            });

            callback(null, filename);
          },
        }),
      }))();

      return interceptor.intercept(context, next);
    }
  }

  const interceptor = mixin(FileChunksInterceptorMixin);
  return interceptor;
}

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, DiskStorageOptions } from 'multer';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';

export const FilePDFInterceptor = (
  fieldName: string,
  options: Omit<DiskStorageOptions, 'storage'>,
) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (_, __, callback) => {
        try {
          const data = fileManager.getPDFFolder();

          callback(null, data);
        } catch (error) {
          callback(error, '');
        }
      },
      ...options,
    }),
  });

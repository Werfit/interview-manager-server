import { FileInterceptor } from '@nestjs/platform-express';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { diskStorage, DiskStorageOptions } from 'multer';

export const FilePDFInterceptor = (
  fieldName: string,
  options: Omit<DiskStorageOptions, 'storage'>,
) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (_, _file, callback) => {
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

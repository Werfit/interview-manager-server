import { randomUUID } from 'node:crypto';

import { FilePDFInterceptor } from 'apps/server/shared/interceptors/file-pdf.interceptor';

export const CVInterceptor = (fieldName: string) =>
  FilePDFInterceptor(fieldName, {
    filename: (_, __, callback) => {
      const timestamp = Date.now();

      const uuid = randomUUID();

      callback(null, `${uuid}-${timestamp}.pdf`);
    },
  });

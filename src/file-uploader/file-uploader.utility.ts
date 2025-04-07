import { join } from 'node:path';

export const getUploadPath = () => {
  return join(process.cwd(), 'uploads');
};

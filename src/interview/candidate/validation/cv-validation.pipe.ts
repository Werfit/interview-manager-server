import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFileOptions,
  ParseFilePipe,
} from '@nestjs/common';

export class CVValidationPipe extends ParseFilePipe {
  constructor(options?: Omit<ParseFileOptions, 'validators'>) {
    super({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        new FileTypeValidator({ fileType: 'application/pdf' }),
      ],
    });
  }
}

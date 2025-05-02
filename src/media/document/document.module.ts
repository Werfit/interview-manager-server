import { Module } from '@nestjs/common';
import { AttachmentModule } from 'src/attachment/attachment.module';

import { DocumentService } from './document.service';

@Module({
  imports: [AttachmentModule],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}

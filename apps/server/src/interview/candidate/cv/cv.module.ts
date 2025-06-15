import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AnalyzerModule } from 'apps/server/analyzer/analyzer.module';
import { DocumentModule } from 'apps/server/media/document/document.module';
import { EmbeddingModule } from 'libs/embedding';
import { EmbeddingDatabaseModule } from 'libs/embedding-database';

import { CV_QUEUE_NAME } from './cv.constants';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CVProcessor } from './processors/cv.processor';

@Module({
  imports: [
    AnalyzerModule,
    EmbeddingDatabaseModule,
    EmbeddingModule.forRootAsync((configService) => ({
      model: configService.getOrThrow('embedding.model'),
      connectionOptions: {
        provider: configService.getOrThrow('embedding.provider'),
        url: configService.getOrThrow('embedding.url'),
      },
    })),
    DocumentModule,
    BullModule.registerQueue({
      name: CV_QUEUE_NAME,
    }),
  ],
  controllers: [CvController],
  providers: [CvService, CVProcessor],
  exports: [CvService],
})
export class CvModule {}

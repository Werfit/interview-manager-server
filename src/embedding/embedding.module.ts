import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmbeddingService } from './embedding.service';

@Module({
  providers: [
    {
      provide: EmbeddingService,
      useFactory: (configService: ConfigService) =>
        new EmbeddingService({
          model: configService.getOrThrow('embedding.model'),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmbeddingDatabaseService } from './embedding-database.service';

@Module({
  providers: [
    {
      provide: EmbeddingDatabaseService,
      useFactory: (configService: ConfigService) =>
        new EmbeddingDatabaseService({
          url: configService.getOrThrow('database.chroma.url'),
          collection: configService.getOrThrow('database.chroma.collection'),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [EmbeddingDatabaseService],
})
export class EmbeddingDatabaseModule {}

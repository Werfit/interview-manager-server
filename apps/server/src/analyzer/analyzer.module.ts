import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AnalyzerService } from './analyzer.service';

@Module({
  providers: [
    {
      provide: AnalyzerService,
      useFactory: (configService: ConfigService) => {
        return new AnalyzerService({
          url: configService.getOrThrow('app.analyzerOrigin'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}

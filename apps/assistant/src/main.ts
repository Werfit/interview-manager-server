import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const initializeMiddlewares = (
  app: INestApplication,
  configService: ConfigService,
) => {
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: configService.getOrThrow<string>('app.cors'),
    credentials: true,
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  initializeMiddlewares(app, configService);

  await app.listen(configService.getOrThrow<number>('app.port'));
}
bootstrap();

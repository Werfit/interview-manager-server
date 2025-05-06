import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './shared/gateways/adapters/redis-io.adapter';

const initializeWebSocketAdapter = async (
  app: INestApplication,
  configService: ConfigService,
) => {
  const adapter = new RedisIoAdapter(configService);
  await adapter.connectToRedis();
  app.useWebSocketAdapter(adapter);
};

const initializeMiddlewares = (
  app: INestApplication,
  configService: ConfigService,
) => {
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: configService.getOrThrow<string>('app.cors'),
    credentials: true,
  });
  app.use(cookieParser());
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  initializeMiddlewares(app, configService);
  await initializeWebSocketAdapter(app, configService);

  await app.listen(configService.getOrThrow<number>('app.port'));
  await app.startAllMicroservices();
}
bootstrap();

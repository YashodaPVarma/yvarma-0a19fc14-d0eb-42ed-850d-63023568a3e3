/**
 * Minimal backend bootstrap for the assessment API.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from './app/seed';

/** Create and start the NestJS application. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** Seed initial data on startup if needed. */
  const dataSource = app.get(DataSource);
  await seedDatabase(dataSource);

  const globalPrefix = 'api';

  /** Allow frontend running on localhost:4200 to call this API. */
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const uploadsPath = join(process.cwd(), 'uploads');

  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  app.setGlobalPrefix('api');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
}

void bootstrap();

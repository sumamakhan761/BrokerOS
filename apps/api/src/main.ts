import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

import path from 'path';
import { fileURLToPath } from 'url';

// Load root .env (for shared secrets) and local .env (for API configs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnv = path.resolve(__dirname, '../../../.env');
try {
  process.loadEnvFile(rootEnv);
} catch {}
try {
  process.loadEnvFile();
} catch {}

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth raw body parsing
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();
  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load .env if available (skipped in Docker where env vars come from compose)
try { process.loadEnvFile(); } catch { }

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth raw body parsing
  });
  app.enableCors();

  app.enableCors();
  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
}
bootstrap();


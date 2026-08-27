/**
 * apps/workers — BrokerOS Async Job Workers
 *
 * This app handles all background/async work:
 * - SMS & WhatsApp blast jobs (Gupshup, WATI)
 * - Real estate portal sync (99acres, MagicBricks, Housing.com)
 * - AI voice agent callbacks (Serveom AI, Vona AI, 11Labs)
 * - Email campaigns (Amazon SES, MailChimp)
 * - Payment webhook processing (Razorpay, PayU)
 *
 * Stack: NestJS Microservice + BullMQ + Redis
 * Status: SKELETON — not yet functional. Add BullMQ when ready.
 */

import { NestFactory } from '@nestjs/core';
import { WorkersModule } from './workers.module.js';

async function bootstrap() {
  const app = await NestFactory.create(WorkersModule);
  await app.listen(3334);
  console.log('Workers app running on port 3334');
}

bootstrap();

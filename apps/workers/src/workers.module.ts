import { Module } from '@nestjs/common';
import { MarketingEmailProcessor } from './processors/marketing-email.processor.js';

@Module({
  imports: [],
  providers: [MarketingEmailProcessor],
  exports: [MarketingEmailProcessor],
})
export class WorkersModule {}

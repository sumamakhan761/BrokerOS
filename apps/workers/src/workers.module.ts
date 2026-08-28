import { Module } from '@nestjs/common';
import { WorkersController } from './workers.controller.js';
import { MarketingEmailProcessor } from './processors/marketing-email.processor.js';
import { MarketingSmsProcessor } from './processors/marketing-sms.processor.js';

@Module({
  imports: [],
  controllers: [WorkersController],
  providers: [MarketingEmailProcessor, MarketingSmsProcessor],
  exports: [MarketingEmailProcessor, MarketingSmsProcessor],
})
export class WorkersModule { }


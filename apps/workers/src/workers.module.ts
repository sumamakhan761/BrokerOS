import { Module } from '@nestjs/common';
import { WorkersController } from './workers.controller.js';
import { MarketingEmailProcessor } from './processors/marketing-email.processor.js';

@Module({
  imports: [],
  controllers: [WorkersController],
  providers: [MarketingEmailProcessor],
  exports: [MarketingEmailProcessor],
})
export class WorkersModule { }

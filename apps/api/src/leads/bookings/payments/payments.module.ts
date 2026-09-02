import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsCron } from './payments.cron.js';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsCron],
  exports: [PaymentsService],
})
export class PaymentsModule {}

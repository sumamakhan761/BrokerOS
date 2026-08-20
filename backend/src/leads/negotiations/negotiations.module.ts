import { Module } from '@nestjs/common';
import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [NegotiationsController],
  providers: [NegotiationsService],
  exports: [NegotiationsService],
})
export class NegotiationsModule {}

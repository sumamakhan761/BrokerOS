import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { CallRecordsModule } from '../call-records/call-records.module.js';

@Module({
  imports: [PrismaModule, CallRecordsModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}

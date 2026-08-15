import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}

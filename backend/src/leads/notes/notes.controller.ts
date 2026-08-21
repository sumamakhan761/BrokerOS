import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { NotesService } from './notes.service.js';
import { LeadStatus } from '../../generated/prisma/client.js';
import { CreateNoteDto, GenerateAiTransitionDto } from './dto/create-note.dto.js';

@Controller('api/leads')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':id/notes')
  getNotes(@Param('id') id: string) {
    return this.notesService.getNotes(id);
  }

  @Post(':id/notes')
  createNote(
    @Param('id') id: string,
    @Body() noteData: CreateNoteDto,
  ) {
    return this.notesService.createNote(id, {
      content: noteData.content,
      userId: noteData.userId,
      noteType: noteData.noteType,
      statusAtTimeOfNote: noteData.statusAtTimeOfNote,
    });
  }

  @Post(':id/ai-transition-note')
  async generateAiTransition(
    @Param('id') id: string,
    @Body() data: GenerateAiTransitionDto
  ) {
    return this.notesService.generateAiTransition(id, data.userId);
  }
}

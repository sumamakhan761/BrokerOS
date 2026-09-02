import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { LeadStatus } from '@brokeros/prisma';
import { TranscriptionService } from '../call-records/transcription.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private transcriptionService: TranscriptionService,
  ) {}

  async getNotes(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    return this.prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });
  }

  async createNote(leadId: string, data: CreateNoteDto) {
    if (data.noteType === 'NEGOTIATION') {
      throw new Error(
        'Negotiations must be created via the dedicated negotiations API, not as notes.',
      );
    }

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    if (data.statusAtTimeOfNote) {
      // Fetch current lead to compare status
      const currentLead = await this.prisma.lead.findUnique({
        where: { id: leadId },
      });
      const updateData: any = { status: data.statusAtTimeOfNote };

      // Reset subStatus to PENDING if status is changing
      if (currentLead && currentLead.status !== data.statusAtTimeOfNote) {
        updateData.subStatus = 'PENDING';
      }

      // Update lead status alongside the note
      await this.prisma.lead.update({
        where: { id: leadId },
        data: updateData,
      });
    }

    return this.prisma.note.create({
      data: {
        leadId,
        content: data.content,
        userId: data.userId,
        statusAtTimeOfNote: data.statusAtTimeOfNote,
        noteType: data.noteType,
      },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });
  }

  async generateAiTransition(leadId: string, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        callRecords: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!lead) throw new Error('Lead not found');

    const summaries = lead.callRecords
      .map((c) => c.aiSummary)
      .filter(Boolean) as string[];

    const result = await this.transcriptionService.generateAutoStatusAndNote(
      lead.status,
      summaries,
    );
    if (!result) throw new Error('AI could not generate transition');

    const updateData: any = {};
    if (result.suggestedStatus !== lead.status) {
      updateData.status = result.suggestedStatus as LeadStatus;
      updateData.subStatus = 'PENDING';
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: updateData,
      });
    }

    const note = await this.prisma.note.create({
      data: {
        leadId,
        content: result.transitionNote,
        userId,
        statusAtTimeOfNote: result.suggestedStatus as LeadStatus,
        noteType: 'AI_TRANSITION',
      },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });

    return { suggestedStatus: result.suggestedStatus, note };
  }
}

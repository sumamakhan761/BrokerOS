import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { TranscriptionService } from '../leads/call-records/transcription.service.js';

@Injectable()
export class BrokerAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async generateAiTransitionNote(brokerId: string, userId: string) {
    const broker = await this.prisma.broker.findUnique({
      where: { id: brokerId },
      include: {
        callRecords: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    const summaries = broker.callRecords
      .map((cr) => cr.aiSummary)
      .filter(Boolean) as string[];

    if (summaries.length === 0) {
      return {
        success: false,
        message: 'No call summaries available to generate transition note.',
      };
    }

    const result = await this.transcriptionService.generateAutoStatusAndNote(
      broker.status,
      summaries,
      'BROKER',
    );
    if (!result) {
      return {
        success: false,
        message: 'Failed to generate AI transition note.',
      };
    }

    if (result.suggestedStatus !== broker.status) {
      await this.prisma.broker.update({
        where: { id: brokerId },
        data: { status: result.suggestedStatus as any },
      });
    }

    const note = await this.prisma.note.create({
      data: {
        brokerId,
        userId,
        content: result.transitionNote,
        noteType: 'AI_TRANSITION',
      },
    });

    return { success: true, note, newStatus: result.suggestedStatus };
  }
}

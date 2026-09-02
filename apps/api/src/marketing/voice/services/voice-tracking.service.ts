import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type { VoiceWebhookEvent } from '@brokeros/types';

@Injectable()
export class VoiceTrackingService {
  private readonly logger = new Logger(VoiceTrackingService.name);
  private readonly prisma = prismaClient;

  async processWebhookEvents(events: VoiceWebhookEvent[]): Promise<void> {
    for (const event of events) {
      try {
        const recipient = await this.prisma.voiceRecipient.findFirst({
          where: {
            OR: [
              { providerCallId: event.providerCallId },
              { phone: event.recipientPhone },
            ],
          },
          include: {
            lead: true,
          },
        });

        if (!recipient) {
          this.logger.warn(
            `No recipient matched for call event ${event.providerCallId} (${event.recipientPhone})`,
          );
          continue;
        }

        const isSuccess = event.disposition === 'COMPLETED';
        const extractedJson =
          event.extractedData || (recipient.extractedData as any) || undefined;

        await this.prisma.voiceRecipient.update({
          where: { id: recipient.id },
          data: {
            status: isSuccess ? 'DELIVERED' : 'FAILED',
            disposition: event.disposition,
            callDurationSec: event.durationSec || recipient.callDurationSec,
            recordingUrl: event.recordingUrl || recipient.recordingUrl,
            transcript: event.transcript || recipient.transcript,
            summary: event.summary || recipient.summary,
            sentiment: event.sentiment || recipient.sentiment,
            extractedData: extractedJson ? extractedJson : undefined,
            completedAt: new Date(),
          },
        });

        // Add to Call Audit Log
        await this.prisma.voiceCallLog.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipient.id,
            disposition: event.disposition,
            durationSec: event.durationSec || 0,
            recordingUrl: event.recordingUrl,
            transcript: event.transcript,
            summary: event.summary,
            sentiment: event.sentiment,
            extractedData: extractedJson ? extractedJson : undefined,
            timestamp: event.timestamp || new Date(),
          },
        });

        // Upgrade lead to HOT if sentiment is POSITIVE
        if (recipient.leadId && event.sentiment === 'POSITIVE') {
          await this.prisma.lead.update({
            where: { id: recipient.leadId },
            data: {
              temperature: 'HOT',
              status: 'QUALIFIED',
            },
          });

          const noteUserId =
            recipient.lead?.assignedUserId || recipient.lead?.createdById;
          if (noteUserId) {
            await this.prisma.note.create({
              data: {
                leadId: recipient.leadId,
                userId: noteUserId,
                content: `[AI Voice Broadcast] Client showed high positive interest during AI voice call. Summary: ${event.summary || 'Interested in property site visit.'}`,
              },
            });
          }
        }
      } catch (err: any) {
        this.logger.error(
          `Error processing voice webhook event: ${err?.message}`,
        );
      }
    }
  }
}

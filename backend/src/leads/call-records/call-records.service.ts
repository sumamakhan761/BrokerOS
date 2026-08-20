import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { TranscriptionService } from './transcription.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';
import { put } from '@vercel/blob';
import PQueue from 'p-queue';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class CallRecordsService {
  private transcriptionQueue = new PQueue({ concurrency: 1 });

  constructor(
    private prisma: PrismaService,
    private transcriptionService: TranscriptionService,
    private notificationsService: NotificationsService,
  ) {}

  async getCallRecord(id: string) {
    return this.prisma.callRecord.findUnique({ where: { id } });
  }

  async uploadCallRecord(file: any, data: { phoneNumber: string; startedAt: string; endedAt: string }) {
    const lead = await this.prisma.lead.findFirst({
      where: { phone: data.phoneNumber },
    });

    let broker: any = null;
    if (!lead) {
      broker = await this.prisma.broker.findFirst({
        where: { phone: data.phoneNumber },
      });
    }

    if (!lead && !broker) {
      console.log(`No lead or broker found for phone number: ${data.phoneNumber}`);
      return { success: false, message: 'No lead or broker found' };
    }

    const targetId = lead ? lead.id : broker!.id;
    const blob = await put(`calls/${targetId}-${Date.now()}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const assignedUserId = lead 
      ? (lead.assignedUserId || (await this.prisma.user.findFirst())?.id)
      : (broker!.sourcingManagerId || (await this.prisma.user.findFirst())?.id);

    if (!assignedUserId) {
      return { success: false, message: 'No valid user found to assign call record' };
    }

    const callRecord = await this.prisma.callRecord.create({
      data: {
        leadId: lead ? lead.id : undefined,
        brokerId: broker ? broker.id : undefined,
        userId: assignedUserId,
        phoneNumber: data.phoneNumber,
        direction: 'OUTBOUND',
        status: 'CONNECTED',
        startedAt: new Date(Number(data.startedAt)),
        endedAt: new Date(Number(data.endedAt)),
        recordingUrl: blob.url,
        recordingSize: file.size,
      },
    });

    // Notification #17: Call Milestone Achievement
    // Notification #20: Daily Task Completion
    try {
      // Background check for daily task completion
      this.notificationsService.checkDailyTaskCompletion(assignedUserId, 'CALLS').catch(err => {
        console.error("Failed to check daily call task completion:", err);
      });

      const user = await this.prisma.user.findUnique({
        where: { id: assignedUserId },
        select: { role: { select: { code: true } } }
      });

      if (user && user.role && !['PRE_SALES_MANAGER', 'SALES_MANAGER', 'CHANNEL_PARTNER'].includes(user.role.code)) {
        const callCount = await this.prisma.callRecord.count({ where: { userId: assignedUserId } });
        const milestones = [1000, 5000, 10000, 20000, 50000];
        
        if (milestones.includes(callCount)) {
          const existingNotifs = await this.prisma.notification.findMany({
            where: { userId: assignedUserId, type: 'ACHIEVEMENT_MILESTONE' },
            orderBy: { createdAt: 'desc' },
            take: 50
          });
          const alreadySent = existingNotifs.some(n => {
            const meta = n.metadata as any;
            return meta?.achievementType === 'CALLS' && meta?.milestone === callCount;
          });

          if (!alreadySent) {
            await this.notificationsService.createNotification({
              userId: assignedUserId,
              type: NotificationType.ACHIEVEMENT_MILESTONE,
              title: `🎉 Congratulations! You completed ${callCount.toLocaleString()} calls.`,
              body: `Amazing work! You've reached a new call milestone.`,
              actionUrl: `/dashboard/${user.role.code.toLowerCase().replace('_', '-')}/analytics`,
              metadata: {
                achievementType: "CALLS",
                milestone: callCount,
                currentCount: callCount
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to process call milestone notification:", err);
    }

    // Fire-and-forget background transcription + AI scoring job
    this.transcriptionQueue.add(async () => {
      const tempFilePath = path.join(os.tmpdir(), `call-record-${callRecord.id}.mp3`);
      try {
        console.log(`[Queue] Starting transcription for CallRecord ${callRecord.id}`);
        fs.writeFileSync(tempFilePath, file.buffer);

        const transcript = await this.transcriptionService.transcribeAudio(tempFilePath);

        let summary: string | null = null;
        let nextStepSuggestion: string | null = null;
        let leadData: any = null;

        if (transcript && transcript.length > 10) {
          if (callRecord.leadId) {
            leadData = await this.prisma.lead.findUnique({
              where: { id: callRecord.leadId },
              include: { _count: { select: { callRecords: true } } },
            });
          }

          // Fetch active projects to pass to AI
          const availableProjects = await this.prisma.project.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
          });

          const summaryResult = await this.transcriptionService.summarizeCall(
            transcript,
            leadData?.status,
            availableProjects,
          );

          if (typeof summaryResult === 'string') {
            summary = summaryResult;
          } else {
            summary = summaryResult.summary;
            nextStepSuggestion = summaryResult.nextStepSuggestion;

            if (leadData) {
              const updateData: any = {};

              if (nextStepSuggestion) {
                updateData.aiNextStepSuggestion = nextStepSuggestion;
              }

              // Only update if current database field is falsy (Fill Only If Empty)
              if (!leadData.budget && summaryResult.extractedBudget) {
                updateData.budget = summaryResult.extractedBudget;
              }
              if (!leadData.interestedProjectId && summaryResult.extractedProjectId) {
                updateData.interestedProjectId = summaryResult.extractedProjectId;
              }
              if (!leadData.preferredLocation && summaryResult.extractedLocation) {
                updateData.preferredLocation = summaryResult.extractedLocation;
              }
              if (!leadData.requirements && summaryResult.extractedRequirements) {
                updateData.requirements = summaryResult.extractedRequirements;
              }

              if (Object.keys(updateData).length > 0) {
                await this.prisma.lead.update({
                  where: { id: leadData.id },
                  data: updateData,
                });
                console.log(`[Queue] Successfully updated Lead ${leadData.id} with AI extracted info and next step.`);
              }
            }
          }

          // AI Lead Scoring Logic
          if (leadData && (!leadData.score || leadData.score === 0) && leadData._count.callRecords <= 3) {
            console.log(`[Queue] Triggering AI Lead Scoring for Lead: ${leadData.id} (Call attempt: ${leadData._count.callRecords})`);
            const aiScoreData = await this.transcriptionService.generateLeadScore(transcript);

            if (aiScoreData && aiScoreData.score > 0) {
              let newTemperature = leadData.temperature;
              if (aiScoreData.score >= 80) newTemperature = 'HOT';
              else if (aiScoreData.score >= 40) newTemperature = 'WARM';
              else newTemperature = 'COLD';

              await this.prisma.lead.update({
                where: { id: leadData.id },
                data: { score: aiScoreData.score, temperature: newTemperature },
              });
              console.log(`[Queue] Successfully updated Lead score to ${aiScoreData.score} and temperature to ${newTemperature} (Category: ${aiScoreData.category})`);
            } else if (aiScoreData && aiScoreData.score === 0) {
              console.log(`[Queue] AI scored as 0 (${aiScoreData.category}). Not updating score to allow retry on next call.`);
            }
          }

          // AI Follow-up Scheduling Logic
          if ((leadData || callRecord.brokerId) && summaryResult !== null && typeof summaryResult !== 'string' && summaryResult.scheduleFollowUp && summaryResult.followUpIsoDate) {
            try {
              const targetType = leadData ? 'Lead' : 'Broker';
              const targetId = leadData ? leadData.id : callRecord.brokerId;
              console.log(`[Queue] Triggering AI Auto-Schedule Follow-up for ${targetType}: ${targetId}`);
              const parsedDate = new Date(summaryResult.followUpIsoDate);
              
              if (!isNaN(parsedDate.getTime())) {
                await this.prisma.followUp.create({
                  data: {
                    leadId: leadData ? leadData.id : undefined,
                    brokerId: !leadData ? callRecord.brokerId : undefined,
                    userId: assignedUserId,
                    scheduledDate: parsedDate,
                    type: summaryResult.followUpTitle || 'Follow-up Call',
                    remarks: summaryResult.followUpRemarks || 'Automatically scheduled by AI based on call transcript.',
                    status: 'SCHEDULED'
                  }
                });
                console.log(`[Queue] Successfully scheduled follow-up on ${parsedDate.toISOString()}`);
              } else {
                console.log(`[Queue] AI provided invalid follow-up date: ${summaryResult.followUpIsoDate}`);
              }
            } catch (err) {
              console.error(`[Queue] Failed to schedule follow-up:`, err);
            }
          }
        }

        await this.prisma.callRecord.update({
          where: { id: callRecord.id },
          data: {
            aiTranscript: transcript,
            aiSummary: summary,
          },
        });

        console.log(`[Queue] Successfully processed CallRecord: ${callRecord.id}`);
      } catch (error) {
        console.error(`[Queue] Error transcribing CallRecord ${callRecord.id}:`, error);
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    return { success: true, callRecord };
  }
}

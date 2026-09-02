import { Injectable } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import {
  AddBrokerNoteDto,
  AddBrokerFollowUpDto,
  AddBrokerMeetingDto,
  CompleteMeetingDto,
} from './dto/broker.dto.js';

@Injectable()
export class BrokerActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async addNote(brokerId: string, userId: string, data: AddBrokerNoteDto) {
    return this.prisma.note.create({
      data: {
        content: data.content,
        brokerId,
        userId,
      },
    });
  }

  async addFollowUp(
    brokerId: string,
    userId: string,
    data: AddBrokerFollowUpDto,
  ) {
    return this.prisma.followUp.create({
      data: {
        type: data.type || 'CALL',
        remarks: `${data.title ? data.title + ' - ' : ''}${data.notes || ''}`,
        scheduledDate: new Date(data.scheduledDate),
        brokerId,
        userId,
      },
    });
  }

  async addMeeting(
    brokerId: string,
    userId: string,
    data: AddBrokerMeetingDto,
  ) {
    return this.prisma.brokerMeeting.create({
      data: {
        scheduledDate: new Date(data.scheduledAt),
        meetingNotes: `Title: ${data.title || ''}\nType: ${data.meetingType || 'OFFICE'}\nAgenda: ${data.agenda || ''}`,
        destinationUrl: data.destinationUrl || null,
        brokerId,
        userId,
      },
    });
  }

  async arriveAtMeeting(
    brokerId: string,
    meetingId: string,
    userId: string,
    locationData: { latitude: number; longitude: number },
  ) {
    // Check if the meeting belongs to this broker and user (if security check is needed)
    return this.prisma.brokerMeeting.update({
      where: { id: meetingId },
      data: {
        arrivedAt: new Date(),
        arriveLatitude: locationData.latitude,
        arriveLongitude: locationData.longitude,
      },
    });
  }

  async completeMeeting(
    brokerId: string,
    meetingId: string,
    userId: string,
    data: CompleteMeetingDto,
  ) {
    return this.prisma.brokerMeeting.update({
      where: { id: meetingId },
      data: {
        actualDate: new Date(),
        status: 'COMPLETED',
        meetingNotes: `Title: ${data.title || ''}\nType: ${data.meetingType || 'OFFICE'}\nAgenda: ${data.agenda || ''}\nSatisfaction: ${data.satisfactionLevel || ''}\nCommission Discussed: ${data.commissionDiscussed || ''}\nNext Action: ${data.nextAction || ''}\nNotes: ${data.meetingNotes || ''}`,
      },
    });
  }

  async confirmFollowUp(brokerId: string, followUpId: string, userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const callRecordToday = await this.prisma.callRecord.findFirst({
      where: {
        userId,
        brokerId,
        startedAt: { gte: start, lte: end },
      },
      select: { id: true },
    });

    if (!callRecordToday) {
      return {
        success: false,
        message:
          'No call record found for today. You must call the broker before confirming the follow-up.',
      };
    }

    await this.prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { success: true, message: 'Follow-up confirmed successfully' };
  }
}

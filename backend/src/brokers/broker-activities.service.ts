import { Injectable } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';

@Injectable()
export class BrokerActivitiesService {
  constructor(private readonly prisma: PrismaService) { }

  async addNote(brokerId: string, userId: string, data: any) {
    return this.prisma.note.create({
      data: {
        content: data.content,
        brokerId,
        userId
      }
    });
  }

  async addFollowUp(brokerId: string, userId: string, data: any) {
    return this.prisma.followUp.create({
      data: {
        type: data.type || 'CALL',
        remarks: `${data.title ? data.title + ' - ' : ''}${data.notes || ''}`,
        scheduledDate: new Date(data.scheduledDate),
        brokerId,
        userId
      }
    });
  }

  async addMeeting(brokerId: string, userId: string, data: any) {
    return this.prisma.brokerMeeting.create({
      data: {
        scheduledDate: new Date(data.scheduledAt),
        meetingNotes: `Title: ${data.title || ''}\nType: ${data.meetingType || 'OFFICE'}\nAgenda: ${data.agenda || ''}`,
        destinationUrl: data.destinationUrl || null,
        brokerId,
        userId
      }
    });
  }

  async arriveAtMeeting(brokerId: string, meetingId: string, userId: string, locationData: { latitude: number; longitude: number }) {
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
}

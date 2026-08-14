import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BookingQueryService {
  constructor(private prisma: PrismaService) {}

  async getBooking(leadId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { customer: { leadId } },
      include: {
        unit: true,
        documents: true,
        notes: true,
        loanCase: true,
        agreement: true,
        possession: true
      }
    });

    if (!booking) return null;

    const documents = booking.documents.map(doc => ({
      ...doc,
      url: doc.fileUrl.includes('vercel-storage.com') ? `/api/leads/booking-documents/${doc.id}` : doc.fileUrl,
      name: doc.title,
      type: doc.type
    }));

    // Find the note containing payment details if it exists
    let extraData = {};
    if (booking.notes) {
      for (const note of booking.notes) {
        try {
          const parsed = JSON.parse(note.content);
          if (parsed && parsed.paymentMode) {
            extraData = parsed;
            break;
          }
        } catch (e) { }
      }
    }

    return {
      id: booking.id,
      unitDescription: booking.unitId ? `Unit ${booking.unit.unitNumber}` : '',
      agreedPrice: booking.agreedPrice,
      bookingAmount: booking.tokenAmount,
      paymentMode: (extraData as any).paymentMode,
      transactionRef: (extraData as any).transactionRef,
      loanRequired: (extraData as any).loanRequired || false,
      remarks: booking.cancelReason || (extraData as any).remarks,
      documents,
      status: booking.status,
      createdAt: booking.createdAt,
      loanCase: booking.loanCase,
      agreement: booking.agreement,
      possession: booking.possession
    };
  }

  async getAllBookings(userId: string, roleId: number) {
    // Sales Executive (2)
    if (roleId === 2) {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          salesExecId: userId
        },
        include: {
          customer: { include: { lead: true } },
          unit: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Sales Manager (3) -> should see all bookings from their subordinates. For now, all bookings or filter by subordinate.
    if (roleId === 3) {
      // In a real app we would filter by salesExecId in subordinate list.
      // Assuming for demo manager sees all or specific.
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
          salesExec: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Admins or others
    return this.prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        customer: { include: { lead: true } },
        unit: true,
        salesExec: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

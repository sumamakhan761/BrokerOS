import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BookingStatusService {
  constructor(private prisma: PrismaService) {}

  async markBookingDone(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ 
      where: { id: bookingId },
      include: { unit: { include: { floor: { include: { tower: true } } } } }
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });

    // Also update lead status to BOOKING
    const customer = await this.prisma.customer.findUnique({ where: { id: booking.customerId } });
    let lead: any = null;
    if (customer) {
      lead = await this.prisma.lead.findUnique({ where: { id: customer.leadId } });
      if (lead) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'BOOKING' }
        });
      }
    }

    // Auto-create BrokerageRecord if there is a broker attached to the lead
    if (lead && lead.brokerId && booking.unit) {
      const brokerId = lead.brokerId;
      const projectId = booking.unit.floor?.tower?.projectId;

      if (projectId) {
        // Find the Deal Card for this broker and project
        const dealCard = await this.prisma.brokerProjectAssignment.findUnique({
          where: { brokerId_projectId: { brokerId, projectId } }
        });

        if (dealCard) {
          // Check if record already exists
          const existingRecord = await this.prisma.brokerageRecord.findFirst({
            where: { bookingId, brokerId }
          });

          if (!existingRecord) {
            const bookingValue = Number(booking.agreedPrice || 0);
            let brokerageAmount = 0;
            let brokeragePercent: any = null;

            if (dealCard.brokeragePercent) {
              brokeragePercent = dealCard.brokeragePercent;
              brokerageAmount = (bookingValue * Number(brokeragePercent)) / 100;
            } else if (dealCard.brokerageFlat) {
              brokerageAmount = Number(dealCard.brokerageFlat);
            }

            if (brokerageAmount > 0) {
              await this.prisma.brokerageRecord.create({
                data: {
                  brokerId,
                  bookingId,
                  bookingValue,
                  brokeragePercent,
                  brokerageAmount,
                  netPayable: brokerageAmount,
                  status: 'PENDING'
                }
              });
            }
          }
        }
      }
    }

    return updatedBooking;
  }

  async cancelBooking(bookingId: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled');
      }

      // 1. Update Booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelReason: reason || 'Manually cancelled'
        }
      });

      // 2. Free up the Unit if it exists
      if (booking.unitId) {
        await tx.unit.update({
          where: { id: booking.unitId },
          data: {
            status: 'AVAILABLE',
            blockedAt: null,
            blockedById: null,
            reservedAt: null,
            reservedForId: null,
            soldAt: null
          }
        });

        await tx.unitStatusHistory.create({
          data: {
            unitId: booking.unitId,
            fromStatus: 'RESERVED', // Might be SOLD or BLOCKED too, but going simple
            toStatus: 'AVAILABLE',
            changedById: booking.salesExecId || 'SYSTEM', // assuming same user or admin
            reason: reason || 'Booking cancelled'
          }
        });
      }

      return updatedBooking;
    });
  }
}

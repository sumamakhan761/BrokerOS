import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';

@Injectable()
export class BookingCreationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async createBooking(leadId: string, data: {
    userId: string;
    unitId?: string;
    unitDescription?: string;
    agreedPrice?: number;
    bookingAmount?: number;
    commissionPercentage?: number;
    commissionAmount?: number;
    paymentMode?: string;
    transactionRef?: string;
    loanRequired?: boolean;
    remarks?: string;
  }) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    let customer = await this.prisma.customer.findUnique({ where: { leadId } });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          leadId,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          email: lead.email,
        }
      });
    }

    // Using transaction to prevent race conditions when grabbing an available unit
    const result = await this.prisma.$transaction(async (tx) => {
      let unit: any = undefined;

      if (data.unitId) {
        unit = await tx.unit.findUnique({
          where: { id: data.unitId },
          include: { floor: { include: { tower: true } } }
        });
        if (!unit) throw new Error('Unit not found');
        if (unit.status !== 'AVAILABLE') throw new Error('Selected unit is no longer available');

        let finalCommPercent = data.commissionPercentage;
        let finalCommAmount = data.commissionAmount;

        // Auto-fetch commission from Deal Card if broker is attached
        if (lead.brokerId && unit.floor?.tower?.projectId) {
          const dealCard = await tx.brokerProjectAssignment.findUnique({
            where: {
              brokerId_projectId: {
                brokerId: lead.brokerId,
                projectId: unit.floor.tower.projectId
              }
            }
          });

          if (dealCard && dealCard.brokeragePercent) {
            finalCommPercent = Number(dealCard.brokeragePercent);
            if (data.agreedPrice && finalCommPercent !== undefined) {
              finalCommAmount = (data.agreedPrice * finalCommPercent) / 100;
            }
          }
        }

        // Block/Reserve the unit immediately
        await tx.unit.update({
          where: { id: data.unitId },
          data: {
            status: 'RESERVED',
            reservedAt: new Date(),
            reservedForId: data.userId,
            ...(finalCommPercent !== undefined ? { commissionPercentage: finalCommPercent } : {})
          }
        });

        await tx.unitStatusHistory.create({
          data: {
            unitId: data.unitId,
            fromStatus: unit.status,
            toStatus: 'RESERVED',
            changedById: data.userId,
            reason: 'Booking initiated'
          }
        });

        // Re-assign data so the booking record gets the updated commission
        data.commissionPercentage = finalCommPercent;
        data.commissionAmount = finalCommAmount;
      } else {
        // Fallback for old frontend code that doesn't pass unitId
        unit = await tx.unit.findFirst({ where: { status: 'AVAILABLE' } });
        if (!unit) {
          unit = await tx.unit.findFirst(); // just grab any if no available (testing fallback)
        }
      }

      const booking = await tx.booking.create({
        data: {
          bookingNumber: `BKG-${Date.now()}`,
          customerId: customer.id,
          unitId: unit?.id,
          source: 'DIRECT',
          salesExecId: data.userId,
          agreedPrice: data.agreedPrice || 0,
          totalPayable: data.agreedPrice || 0,
          tokenAmount: data.bookingAmount || 0,
          commissionPercentage: data.commissionPercentage,
          commissionAmount: data.commissionAmount,
          status: 'DOCUMENTATION_PENDING',
          cancelReason: data.remarks,
        }
      });

      await tx.note.create({
        data: {
          bookingId: booking.id,
          userId: data.userId,
          content: JSON.stringify({
            unitDescription: data.unitDescription,
            paymentMode: data.paymentMode,
            transactionRef: data.transactionRef,
            loanRequired: data.loanRequired,
            remarks: data.remarks
          })
        }
      });

      return booking;
    });

    // Notifications have been moved to ApprovalsService (triggered upon booking confirmation)

    return result;
  }
}

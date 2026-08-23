import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '@brokeros/prisma';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto.js';

@Injectable()
export class BookingCreationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async createBooking(leadId: string, data: CreateBookingDto) {
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

  async updateBooking(bookingId: string, data: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { unit: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CONFIRMED') throw new Error('Cannot edit confirmed booking');

    await this.prisma.$transaction(async (tx) => {
      let finalUnitId = booking.unitId;
      let finalCommPercent = data.commissionPercentage;
      let finalCommAmount = data.commissionAmount;

      // Handle unit change
      if (data.unitId && data.unitId !== booking.unitId) {
        // Free up old unit if it was reserved
        if (booking.unitId) {
          await tx.unit.update({
            where: { id: booking.unitId },
            data: { status: 'AVAILABLE', reservedAt: null, reservedForId: null }
          });
        }

        // Reserve new unit
        const newUnit = await tx.unit.findUnique({
          where: { id: data.unitId },
          include: { floor: { include: { tower: true } } }
        });
        if (!newUnit || newUnit.status !== 'AVAILABLE') {
          throw new Error('New selected unit is not available');
        }

        // Auto-fetch commission if broker is attached
        const customer = await tx.customer.findUnique({
          where: { id: booking.customerId },
          include: { lead: true }
        });

        if (customer?.lead?.brokerId && newUnit.floor?.tower?.projectId) {
          const dealCard = await tx.brokerProjectAssignment.findUnique({
            where: {
              brokerId_projectId: {
                brokerId: customer.lead.brokerId,
                projectId: newUnit.floor.tower.projectId
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

        await tx.unit.update({
          where: { id: data.unitId },
          data: {
            status: 'RESERVED',
            reservedAt: new Date(),
            reservedForId: data.userId,
            ...(finalCommPercent !== undefined ? { commissionPercentage: finalCommPercent } : {})
          }
        });

        finalUnitId = data.unitId;
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          unitId: finalUnitId,
          agreedPrice: data.agreedPrice || booking.agreedPrice,
          totalPayable: data.agreedPrice || booking.totalPayable,
          tokenAmount: data.bookingAmount || booking.tokenAmount,
          commissionPercentage: finalCommPercent !== undefined ? finalCommPercent : booking.commissionPercentage,
          commissionAmount: finalCommAmount !== undefined ? finalCommAmount : booking.commissionAmount,
          cancelReason: data.remarks || booking.cancelReason,
        }
      });

      // Find the first note for this booking (which contains the form details)
      const firstNote = await tx.note.findFirst({
        where: { bookingId },
        orderBy: { createdAt: 'asc' }
      });

      if (firstNote) {
        await tx.note.update({
          where: { id: firstNote.id },
          data: {
            content: JSON.stringify({
              unitDescription: data.unitDescription,
              paymentMode: data.paymentMode,
              transactionRef: data.transactionRef,
              loanRequired: data.loanRequired,
              remarks: data.remarks
            })
          }
        });
      }
    });

    return { success: true };
  }
}

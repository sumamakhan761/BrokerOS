import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { put } from '@vercel/blob';
import { CreateScheduleDto } from './dto/payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createSchedule(bookingId: string, data: CreateScheduleDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const netAmount = data.netAmount;
    const startDate = new Date(data.startDate);
    const schedules: Prisma.PaymentScheduleCreateManyInput[] = [];

    if (data.percentagePerMonth && data.percentagePerMonth > 0) {
      // --- Mode 2: Percentage Per Month ---
      const monthlyAmount = (data.percentagePerMonth / 100) * netAmount;
      const fullMonths = Math.floor(netAmount / monthlyAmount);
      const remainder = parseFloat((netAmount - fullMonths * monthlyAmount).toFixed(2));
      const totalInstallments = remainder > 0 ? fullMonths + 1 : fullMonths;

      for (let i = 0; i < totalInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const isLast = i === totalInstallments - 1;
        const amount = isLast && remainder > 0 ? remainder : monthlyAmount;
        const roundedAmount = parseFloat(amount.toFixed(2));

        schedules.push({
          bookingId,
          milestoneName: `Installment ${i + 1}`,
          sequenceOrder: i + 1,
          amount: roundedAmount,
          dueDate,
          status: 'PENDING',
          remainingAmount: roundedAmount,
        });
      }
    } else {
      // --- Mode 1: Fixed Installments Count ---
      const count = data.installmentsCount || 1;
      const freq = data.frequency || 'MONTHLY';
      const baseAmount = parseFloat((netAmount / count).toFixed(2));
      // Handle rounding: accumulate remainder on last installment
      const totalAllocated = parseFloat((baseAmount * (count - 1)).toFixed(2));
      const lastAmount = parseFloat((netAmount - totalAllocated).toFixed(2));

      for (let i = 0; i < count; i++) {
        const dueDate = new Date(startDate);
        if (freq === 'MONTHLY') {
          dueDate.setMonth(dueDate.getMonth() + i);
        } else {
          dueDate.setMonth(dueDate.getMonth() + i * 3);
        }

        const isLast = i === count - 1;
        const amount = isLast ? lastAmount : baseAmount;

        schedules.push({
          bookingId,
          milestoneName: `Installment ${i + 1}`,
          sequenceOrder: i + 1,
          amount,
          dueDate,
          status: 'PENDING',
          remainingAmount: amount,
        });
      }
    }

    await this.prisma.paymentSchedule.createMany({ data: schedules });

    return this.prisma.paymentSchedule.findMany({
      where: { bookingId },
      orderBy: { sequenceOrder: 'asc' },
    });
  }

  async getPendingPayments(closingManagerId?: string) {
    return this.prisma.paymentSchedule.findMany({
      where: {
        status: 'PENDING',
        ...(closingManagerId ? {
          booking: {
            customer: {
              lead: {
                assignedUserId: closingManagerId
              }
            }
          }
        } : {})
      },
      include: {
        booking: {
          include: {
            customer: {
              include: {
                lead: true
              }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getSchedulesByBooking(bookingId: string) {
    return this.prisma.paymentSchedule.findMany({
      where: { bookingId },
      orderBy: { sequenceOrder: 'asc' },
      include: {
        transactions: true
      }
    });
  }

  async markAsPaid(
    scheduleId: string,
    amountPaid: number,
    remarks?: string,
    file?: Express.Multer.File
  ) {
    const schedule = await this.prisma.paymentSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      throw new NotFoundException('Payment schedule not found');
    }

    let receiptUrl: string | null = null;

    // Upload receipt to Vercel Blob with private access
    if (file) {
      const blob = await put(`receipts/${schedule.bookingId}-${Date.now()}-${file.originalname}`, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      receiptUrl = blob.url;
    }

    const fallbackUser = await this.prisma.user.findFirst();
    const recordedById = fallbackUser ? fallbackUser.id : schedule.bookingId;

    // Create a PaymentTransaction record
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        paymentScheduleId: scheduleId,
        amount: amountPaid,
        paymentDate: new Date(),
        paymentMode: 'OTHER',
        remarks: remarks || 'Marked as paid',
        receiptUrl,
        recordedById, 
        // status is not a valid field according to schema
      }
    });

    // Update schedule
    const remainingAmount = Number(schedule.remainingAmount) - amountPaid;
    const newStatus = remainingAmount <= 0 ? 'PAID' : 'PARTIAL';

    const updatedSchedule = await this.prisma.paymentSchedule.update({
      where: { id: scheduleId },
      data: {
        status: newStatus,
        remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
      },
    });

    return { updatedSchedule, transaction };
  }
}

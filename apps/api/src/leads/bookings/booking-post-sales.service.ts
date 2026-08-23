import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { put } from '@vercel/blob';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';

@Injectable()
export class BookingPostSalesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async saveLoanCase(bookingId: string, data: Record<string, any>) {
    const { id, createdAt, updatedAt, bookingId: _, sanctionLetterUrl, loanDocumentUrls, ...cleanData } = data;
    try {
      return await this.prisma.loanCase.upsert({
        where: { bookingId },
        create: { bookingId, ...cleanData },
        update: { ...cleanData }
      });
    } catch (error: any) {
      require('fs').writeFileSync('prisma-error-loan.log', String(error.stack || error.message));
      throw error;
    }
  }

  async saveAgreement(bookingId: string, data: Record<string, any>) {
    const { id, createdAt, updatedAt, bookingId: _, draftDocumentUrl, finalDocumentUrl, ...cleanData } = data;
    try {
      return await this.prisma.agreement.upsert({
        where: { bookingId },
        create: { bookingId, ...cleanData },
        update: { ...cleanData }
      });
    } catch (error: any) {
      require('fs').writeFileSync('prisma-error-agreement.log', String(error.stack || error.message));
      throw error;
    }
  }

  async saveHandover(bookingId: string, data: Record<string, any>) {
    const { id, createdAt, updatedAt, bookingId: _, occupancyCertUrl, completionCertUrl, handoverDocUrl, ...cleanData } = data;
    try {
      const result = await this.prisma.possessionHandover.upsert({
        where: { bookingId },
        create: { bookingId, ...cleanData },
        update: { ...cleanData }
      });

      if (cleanData.status === 'HANDED_OVER' || cleanData.keysHandedOver === true) {
        // Automatically sync the status if keys are handed over
        if (cleanData.keysHandedOver === true && cleanData.status !== 'HANDED_OVER') {
          await this.prisma.possessionHandover.update({
            where: { bookingId },
            data: { status: 'HANDED_OVER' }
          });
        }

        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (booking && booking.unitId) {
          const unit = await this.prisma.unit.findUnique({
            where: { id: booking.unitId },
            include: { floor: { include: { tower: true } } }
          });

          await this.prisma.unit.update({
            where: { id: booking.unitId },
            data: { status: 'SOLD' }
          });

          await this.prisma.unitStatusHistory.create({
            data: {
              unitId: booking.unitId,
              fromStatus: 'RESERVED',
              toStatus: 'SOLD',
              changedById: booking.salesExecId || 'SYSTEM',
              reason: 'Handover Completed'
            }
          });

          // Create Inbound Commission if applicable
          if (unit && (unit.commissionAmount || unit.commissionPercentage)) {
            let amount = 0;
            if (unit.commissionAmount) {
              amount = Number(unit.commissionAmount);
            } else if (unit.commissionPercentage && booking.totalPayable) {
              amount = (Number(unit.commissionPercentage) / 100) * Number(booking.totalPayable);
            }

            if (amount > 0) {
              const existingComm = await this.prisma.inboundCommission.findFirst({
                where: { unitId: unit.id, bookingId: booking.id }
              });
              if (!existingComm) {
                await this.prisma.inboundCommission.create({
                  data: {
                    unitId: unit.id,
                    projectId: unit.floor?.tower?.projectId,
                    bookingId: booking.id,
                    commissionAmount: amount,
                    status: 'PENDING'
                  }
                });
              }
            }
          }

          // ──────────────────────────────────────────────
          // NOTIFICATION #13: Handover Achievement
          // ──────────────────────────────────────────────
          if (cleanData.handoverById) {
            try {
              const fullBookingForNotif = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { customer: true, unit: { include: { floor: { include: { tower: { include: { project: true } } } } } } }
              });
              if (fullBookingForNotif) {
                const projectName = fullBookingForNotif.unit?.floor?.tower?.project?.name || 'Project';
                const unitNumber = fullBookingForNotif.unit?.unitNumber || 'Unit';

                await this.notificationsService.createNotification({
                  userId: cleanData.handoverById,
                  type: NotificationType.RECOGNITION,
                  title: "🎉 Congratulations! Handover completed successfully.",
                  body: `Unit handed over to ${fullBookingForNotif.customer.firstName} ${fullBookingForNotif.customer.lastName || ''} — ${projectName} ${unitNumber}.`,
                  actionUrl: `/dashboard/closing-manager/handover`,
                  metadata: {
                    achievementType: "HANDOVER",
                    bookingId: fullBookingForNotif.id,
                    customerName: `${fullBookingForNotif.customer.firstName} ${fullBookingForNotif.customer.lastName || ''}`,
                    projectName,
                    unit: unitNumber
                  }
                });

                // Notification #19: Booking Count Milestone (via Handover)
                const user = await this.prisma.user.findUnique({
                  where: { id: cleanData.handoverById },
                  select: { role: { select: { code: true } } }
                });

                if (user?.role?.code === 'CLOSING_MANAGER' || user?.role?.code === 'POST_SALES') {
                  const handoverCount = await this.prisma.possessionHandover.count({
                    where: { handoverById: cleanData.handoverById, status: 'HANDED_OVER' }
                  });

                  const bookingMilestones = [10, 25, 50, 100, 200, 250];
                  if (bookingMilestones.includes(handoverCount)) {
                    const existingNotifs = await this.prisma.notification.findMany({
                      where: { userId: cleanData.handoverById, type: 'ACHIEVEMENT_MILESTONE' },
                      orderBy: { createdAt: 'desc' },
                      take: 50
                    });
                    const alreadySent = existingNotifs.some(n => {
                      const meta = n.metadata as any;
                      return meta?.achievementType === 'BOOKINGS' && meta?.milestone === handoverCount;
                    });

                    if (!alreadySent) {
                      await this.notificationsService.createNotification({
                        userId: cleanData.handoverById,
                        type: NotificationType.ACHIEVEMENT_MILESTONE,
                        title: `🎉 Congratulations! You completed ${handoverCount} handovers.`,
                        body: `You just hit the ${handoverCount} handover milestone. Keep it up!`,
                        actionUrl: `/dashboard/${user.role.code.toLowerCase().replace('_', '-')}/analytics`,
                        metadata: {
                          achievementType: "BOOKINGS",
                          milestone: handoverCount,
                          currentCount: handoverCount
                        }
                      });
                    }
                  }
                }
              }
            } catch (err) {
              console.error("Failed to send handover notification", err);
            }
          }

        }
      }

      return result;
    } catch (error: any) {
      require('fs').writeFileSync('prisma-error-handover.log', String(error.stack || error.message));
      throw error;
    }
  }

  async uploadPostSalesFile(bookingId: string, type: 'loan' | 'agreement' | 'handover', fieldName: string, file: Express.Multer.File) {
    const blob = await put(`bookings/${bookingId}/${type}/${fieldName}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (type === 'loan') {
      if (fieldName === 'loanDocumentUrls') {
        const lc = await this.prisma.loanCase.findUnique({ where: { bookingId } });
        const existing = lc?.loanDocumentUrls || [];
        await this.prisma.loanCase.upsert({
          where: { bookingId },
          create: { bookingId, loanDocumentUrls: [...existing, blob.url] },
          update: { loanDocumentUrls: [...existing, blob.url] }
        });
      } else {
        await this.prisma.loanCase.upsert({
          where: { bookingId },
          create: { bookingId, [fieldName]: blob.url },
          update: { [fieldName]: blob.url }
        });
      }
    } else if (type === 'agreement') {
      await this.prisma.agreement.upsert({
        where: { bookingId },
        create: { bookingId, [fieldName]: blob.url },
        update: { [fieldName]: blob.url }
      });
    } else if (type === 'handover') {
      await this.prisma.possessionHandover.upsert({
        where: { bookingId },
        create: { bookingId, [fieldName]: blob.url },
        update: { [fieldName]: blob.url }
      });
    }

    return { url: blob.url };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class PostSalesCommissionsService {
  constructor(private prisma: PrismaService) {}

  async getInboundCommissions() {
    return this.prisma.inboundCommission.findMany({
      include: {
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: { project: true }
                }
              }
            }
          }
        },
        booking: {
          include: {
            customer: true,
            salesExec: true
          }
        },
        project: true,
        receivedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsReceived(id: string, userId: string, receiptData?: any) {
    const comm = await this.prisma.inboundCommission.findUnique({ where: { id } });
    if (!comm) throw new NotFoundException('Commission not found');

    return this.prisma.inboundCommission.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
        receivedById: userId,
        remarks: receiptData?.remarks
      }
    });
  }
}

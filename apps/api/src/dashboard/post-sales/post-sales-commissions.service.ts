import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { ReceiveCommissionDto } from './dto/post-sales.dto.js';

@Injectable()
export class PostSalesCommissionsService {
  constructor(private prisma: PrismaService) {}

  async getInboundCommissions(userId: string, roleId: string) {
    let roleCode = 'ADMIN';
    if (roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (role) roleCode = role.code;
    }

    const where: any = {};
    if (roleCode === 'POST_SALES') {
      where.booking = { assignedPostSalesId: userId };
    }

    return this.prisma.inboundCommission.findMany({
      where,
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

  async markAsReceived(id: string, userId: string, receiptData?: ReceiveCommissionDto) {
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

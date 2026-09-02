import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { put } from '@vercel/blob';

@Injectable()
export class BrokerCommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserRoleCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    return user?.role?.code || '';
  }

  async getCommissions(userId: string) {
    const roleCode = await this.getUserRoleCode(userId);
    let whereClause: any = {};

    if (roleCode === 'SOURCING_MANAGER') {
      whereClause = { broker: { sourcingManagerId: userId } };
    }

    return this.prisma.brokerageRecord.findMany({
      where: whereClause,
      include: {
        broker: { select: { id: true, name: true, phone: true } },
        booking: {
          include: {
            customer: true,
            unit: {
              include: {
                floor: { include: { tower: { include: { project: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeCommission(
    recordId: string,
    userId: string,
    file?: Express.Multer.File,
  ) {
    let paymentReference: string | null = null;

    if (file) {
      const blob = await put(
        `commissions/${recordId}/${file.originalname}`,
        file.buffer,
        {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        },
      );
      paymentReference = blob.url;
    }

    const record = await this.prisma.brokerageRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) throw new NotFoundException('Commission record not found');

    return this.prisma.brokerageRecord.update({
      where: { id: recordId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidAmount: record.netPayable,
        paymentReference: paymentReference || record.paymentReference,
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        broker: true,
        booking: true,
      },
    });
  }
}

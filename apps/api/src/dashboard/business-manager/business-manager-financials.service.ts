import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BusinessManagerFinancialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancials(period?: string) {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = startDate ? { gte: startDate, lte: now } : undefined;

    // 1. Revenue
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { not: 'CANCELLED' },
        ...(dateFilter ? { bookingDate: dateFilter } : {}),
      },
    });

    let totalRevenue = 0;
    for (const b of bookings) {
      totalRevenue += Number(b.agreedPrice) || 0;
    }

    // 2. Collections (Collected, Outstanding, Overdue)
    const collections = await this.prisma.collectionRecord.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdueAmount = 0;
    let countOverdue = 0;

    const overdueByDays = { '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

    for (const c of collections) {
      totalCollected += Number(c.totalCollected) || 0;
      totalOutstanding += Number(c.outstanding) || 0;

      if (c.isOverdue || (c.overdueDays && c.overdueDays > 0)) {
        totalOverdueAmount += Number(c.overdueAmount) || 0;
        countOverdue++;

        const days = c.overdueDays || 0;
        if (days <= 30) overdueByDays['1-30']++;
        else if (days <= 60) overdueByDays['31-60']++;
        else if (days <= 90) overdueByDays['61-90']++;
        else overdueByDays['90+']++;
      }
    }

    // 3. Expenses by Category
    const expenses = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        approvalStatus: 'APPROVED',
        ...(dateFilter ? { expenseDate: dateFilter } : {}),
      },
      _sum: { amount: true },
    });

    const expensesByCategory = expenses.map((e) => ({
      name: e.category,
      value: Number(e._sum.amount) || 0,
    }));

    // 4. Brokerage Commissions (Payouts to CP/Brokers)
    const brokerageRecords = await this.prisma.brokerageRecord.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    const brokerageCommissions = { pending: 0, paid: 0 };
    for (const br of brokerageRecords) {
      if (br.status === 'PENDING')
        brokerageCommissions.pending += Number(br.netPayable) || 0;
      if (br.status === 'PAID')
        brokerageCommissions.paid += Number(br.paidAmount) || 0;
    }

    // 5. Inbound Commissions (from Builders for Brokerage side)
    const inboundCommissionsRaw = await this.prisma.inboundCommission.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    const inboundCommissions = { pending: 0, received: 0 };
    for (const ic of inboundCommissionsRaw) {
      if (ic.status === 'PENDING')
        inboundCommissions.pending += Number(ic.commissionAmount) || 0;
      if (ic.status === 'RECEIVED')
        inboundCommissions.received += Number(ic.commissionAmount) || 0;
    }

    // 6. Invoice Status
    const invoices = await this.prisma.invoice.groupBy({
      by: ['status'],
      where: dateFilter ? { invoiceDate: dateFilter } : {},
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const invoiceStatus = invoices.map((i) => ({
      name: i.status,
      count: i._count.id,
      amount: Number(i._sum.totalAmount) || 0,
    }));

    return {
      revenue: {
        totalRevenue,
        totalCollected,
        totalOutstanding,
      },
      overdueBreakdown: {
        totalOverdueAmount,
        countOverdue,
        overdueByDays: [
          { name: '1-30 days', value: overdueByDays['1-30'] },
          { name: '31-60 days', value: overdueByDays['31-60'] },
          { name: '61-90 days', value: overdueByDays['61-90'] },
          { name: '90+ days', value: overdueByDays['90+'] },
        ],
      },
      expensesByCategory,
      brokerageCommissions,
      inboundCommissions,
      invoiceStatus,
    };
  }
}

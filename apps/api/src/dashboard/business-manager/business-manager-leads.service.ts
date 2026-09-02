import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BusinessManagerLeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeadsOverview(period?: string) {
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

    const leads = await this.prisma.lead.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
      include: {
        source: true,
        interestedProject: true,
        customer: {
          include: { bookings: true },
        },
      },
    });

    const leadFunnel = {
      brokerage: {
        NEW: 0,
        CONTACTED: 0,
        INTERESTED: 0,
        QUALIFIED: 0,
        NEGOTIATION: 0,
        BOOKING: 0,
        LOST: 0,
      },
      cp: {
        NEW: 0,
        CONTACTED: 0,
        INTERESTED: 0,
        QUALIFIED: 0,
        NEGOTIATION: 0,
        BOOKING: 0,
        LOST: 0,
      },
    };

    const sourceMap = new Map<string, { value: number; bookings: number }>();
    const lostAnalysisMap = new Map<string, number>();
    const temperature = { HOT: 0, WARM: 0, COLD: 0 };
    const brokerConversion = { leads: 0, bookings: 0 };

    for (const l of leads) {
      // 1. Brokerage vs CP
      const isCp =
        l.interestedProject?.isCpProject ||
        l.source?.type === 'CHANNEL_PARTNER' ||
        l.brokerId != null;
      const target = isCp ? leadFunnel.cp : leadFunnel.brokerage;

      const statusKey = l.status as keyof typeof target;
      if (target[statusKey] !== undefined) {
        target[statusKey]++;
      } else if (l.status === 'LOST') {
        target.LOST++;
      }

      // If they booked
      const hasBooking = l.customer?.bookings && l.customer.bookings.length > 0;
      if (hasBooking) {
        target.BOOKING++;
      }

      // 2. Sources
      const sourceName = l.source?.name || l.source?.type || 'Unknown';
      if (!sourceMap.has(sourceName))
        sourceMap.set(sourceName, { value: 0, bookings: 0 });
      sourceMap.get(sourceName)!.value++;
      if (hasBooking) sourceMap.get(sourceName)!.bookings++;

      // 3. Lost Analysis
      if (l.status === 'LOST') {
        const reason = l.subStatus || 'No Reason Provided';
        lostAnalysisMap.set(reason, (lostAnalysisMap.get(reason) || 0) + 1);
      }

      // 4. Temperature
      if (l.temperature === 'HOT') temperature.HOT++;
      if (l.temperature === 'WARM') temperature.WARM++;
      if (l.temperature === 'COLD') temperature.COLD++;

      // 5. Broker Conversion
      if (l.brokerId) {
        brokerConversion.leads++;
        if (hasBooking) brokerConversion.bookings++;
      }
    }

    const sourcesBreakdown = Array.from(sourceMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.value,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.value - a.value);

    const lostAnalysis = Array.from(lostAnalysisMap.entries())
      .map(([reason, count]) => ({
        reason,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      leadFunnel,
      sourcesBreakdown,
      lostAnalysis,
      temperature,
      brokerConversionRate: {
        ...brokerConversion,
        rate:
          brokerConversion.leads > 0
            ? Math.round(
                (brokerConversion.bookings / brokerConversion.leads) * 100,
              )
            : 0,
      },
    };
  }
}

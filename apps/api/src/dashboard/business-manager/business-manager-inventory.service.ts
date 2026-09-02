import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BusinessManagerInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(period?: string) {
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

    // Fetch all projects and their units
    const projects = await this.prisma.project.findMany({
      include: {
        towers: {
          include: {
            floors: {
              include: {
                units: {
                  include: {
                    bookings: dateFilter
                      ? {
                          where: {
                            bookingDate: dateFilter,
                            status: { not: 'CANCELLED' },
                          },
                        }
                      : {
                          where: { status: { not: 'CANCELLED' } },
                        },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 1. Total inventory stats
    const totalInventory = {
      total: 0,
      available: 0,
      blocked: 0,
      soldBrokerage: 0,
      soldCp: 0,
      reservedBrokerage: 0,
      reservedCp: 0,
    };

    // 2. Project-wise unit status
    const projectWiseStatus: any[] = [];

    // 3. Construction status per project
    const constructionStatus: any[] = [];

    // 4. Revenue contribution by project
    const revenueContribution: any[] = [];

    for (const p of projects) {
      let pAvailable = 0;
      let pReserved = 0;
      let pSold = 0;
      let pBlocked = 0;
      let pTotal = 0;
      let pRevenue = 0;

      for (const t of p.towers) {
        for (const f of t.floors) {
          for (const u of f.units) {
            pTotal++;
            totalInventory.total++;

            if (u.status === 'AVAILABLE') {
              pAvailable++;
              totalInventory.available++;
            } else if (u.status === 'BLOCKED') {
              pBlocked++;
              totalInventory.blocked++;
            } else if (u.status === 'SOLD') {
              pSold++;
              if (p.isCpProject) totalInventory.soldCp++;
              else totalInventory.soldBrokerage++;
            } else if (u.status === 'RESERVED') {
              pReserved++;
              if (p.isCpProject) totalInventory.reservedCp++;
              else totalInventory.reservedBrokerage++;
            }

            for (const b of u.bookings) {
              pRevenue += Number(b.agreedPrice) || 0;
            }
          }
        }
      }

      revenueContribution.push({
        name: p.name,
        revenue: pRevenue,
        isCp: p.isCpProject,
      });

      projectWiseStatus.push({
        name: p.name,
        total: pTotal,
        available: pAvailable,
        reserved: pReserved,
        sold: pSold,
        blocked: pBlocked,
        isCp: p.isCpProject,
      });

      constructionStatus.push({
        name: p.name,
        status: p.constructionStatus || 'NOT_STARTED',
        isCp: p.isCpProject,
      });
    }

    revenueContribution.sort((a, b) => b.revenue - a.revenue);

    return {
      totalInventory,
      projectWiseStatus,
      constructionStatus,
      revenueContribution,
    };
  }
}

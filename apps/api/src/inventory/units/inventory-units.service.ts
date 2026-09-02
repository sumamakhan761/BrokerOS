import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { UpdateUnitStatusDto, UpdatePossessionDto } from './dto/unit.dto.js';

@Injectable()
export class InventoryUnitsService {
  constructor(private prisma: PrismaService) {}

  async updateUnitStatus(
    unitId: string,
    data: UpdateUnitStatusDto,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!unit) throw new NotFoundException('Unit not found');

      if (data.status && data.status !== unit.status) {
        await tx.unitStatusHistory.create({
          data: {
            unitId,
            fromStatus: unit.status,
            toStatus: data.status as any,
            changedById: userId,
            reason: data.reason,
          },
        });
      }

      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.basePrice !== undefined)
        updateData.basePrice = Number(data.basePrice);
      if (data.commissionPercentage !== undefined)
        updateData.commissionPercentage = Number(data.commissionPercentage);
      if (data.commissionAmount !== undefined)
        updateData.commissionAmount = Number(data.commissionAmount);
      if (data.carpetArea !== undefined)
        updateData.carpetArea = Number(data.carpetArea);
      if (data.type !== undefined) updateData.type = data.type;
      if (data.facing !== undefined) updateData.facing = data.facing;

      if (data.status === 'AVAILABLE' && data.clearBooking) {
        updateData.blockedAt = null;
        updateData.blockedById = null;
        updateData.reservedAt = null;
        updateData.reservedForId = null;
        updateData.soldAt = null;
      }

      return tx.unit.update({
        where: { id: unitId },
        data: updateData,
      });
    });
  }

  async getBookingForUnit(unitId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        unitId,
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        customer: {
          include: { lead: true },
        },
        salesExec: true,
        loanCase: true,
        agreement: true,
        possession: true,
        documents: true,
        brokerageRecords: {
          include: { broker: true },
        },
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!booking) return null;
    return booking;
  }

  async updateProjectPossession(projectId: string, data: UpdatePossessionDto) {
    return this.prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id: projectId },
        data: {
          constructionStatus: data.status as any,
          possessionTimeline: data.timeline,
        },
      });
      await tx.tower.updateMany({
        where: { projectId },
        data: {
          constructionStatus: data.status as any,
          possessionTimeline: data.timeline,
        },
      });
      const towers = await tx.tower.findMany({
        where: { projectId },
        select: { floors: { select: { id: true } } },
      });
      const floorIds = towers.flatMap((t) => t.floors.map((f) => f.id));
      if (floorIds.length > 0) {
        await tx.unit.updateMany({
          where: { floorId: { in: floorIds } },
          data: {
            constructionStatus: data.status as any,
            possessionTimeline: data.timeline,
          },
        });
      }
      return proj;
    });
  }

  async updateTowerPossession(towerId: string, data: UpdatePossessionDto) {
    return this.prisma.$transaction(async (tx) => {
      const tower = await tx.tower.update({
        where: { id: towerId },
        data: {
          constructionStatus: data.status as any,
          possessionTimeline: data.timeline,
        },
        include: { floors: { select: { id: true } } },
      });
      const floorIds = tower.floors.map((f) => f.id);
      if (floorIds.length > 0) {
        await tx.unit.updateMany({
          where: { floorId: { in: floorIds } },
          data: {
            constructionStatus: data.status as any,
            possessionTimeline: data.timeline,
          },
        });
      }
      return tower;
    });
  }

  async updateUnitPossession(unitId: string, data: UpdatePossessionDto) {
    return this.prisma.unit.update({
      where: { id: unitId },
      data: {
        constructionStatus: data.status as any,
        possessionTimeline: data.timeline,
      },
    });
  }
}

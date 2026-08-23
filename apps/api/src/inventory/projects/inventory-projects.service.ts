import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';
import { ProjectQueryDto, CreateProjectDto } from './dto/project.dto.js';

@Injectable()
export class InventoryProjectsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async getProjects(query: ProjectQueryDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) throw new NotFoundException('User not found');

    const roleCode = user.role?.code || '';
    const isAdminOrManager = ['ADMIN', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'DIRECTOR', 'POST_SALES', 'POST_SALES_MANAGER'].includes(roleCode);
    const isCpRole = ['CHANNEL_PARTNER', 'SOURCING_MANAGER', 'CLOSING_MANAGER'].includes(roleCode);

    // If client explicitly passes isCpProject, honour it.
    // Otherwise, default to true for CP roles, false for everyone else.
    let isCpRequest: boolean;
    if (query.isCpProject !== undefined) {
      isCpRequest = query.isCpProject === 'true' || query.isCpProject === true;
    } else {
      isCpRequest = isCpRole;
    }

    if (isAdminOrManager) {
      return this.prisma.project.findMany({
        where: { isCpProject: isCpRequest },
        include: { builder: true, _count: { select: { towers: true } } }
      });
    }

    const projectAssignments = await this.prisma.projectAssignment.findMany({
      where: { userId },
      include: { project: { include: { builder: true, _count: { select: { towers: true } } } } }
    });
    let projects = projectAssignments.map(a => a.project);

    // Also include projects where the user has a tower assignment
    const towerAssignments = await this.prisma.towerAssignment.findMany({
      where: { userId },
      include: { tower: { include: { project: { include: { builder: true, _count: { select: { towers: true } } } } } } }
    });

    towerAssignments.forEach(ta => {
      if (!projects.some(p => p.id === ta.tower.projectId)) {
        projects.push(ta.tower.project);
      }
    });

    return projects.filter(p => p.isCpProject === isCpRequest);
  }

  async createProject(data: CreateProjectDto, userId?: string) {
    const createData: any = { ...data };
    if (createData.builderName && !createData.builderId) {
      createData.builder = { create: { name: createData.builderName } };
      delete createData.builderName;
    }
    // ensure boolean is cast properly if sent as string
    if (createData.isCpProject === 'true' || createData.isCpProject === true) {
      createData.isCpProject = true;
    } else {
      createData.isCpProject = false;
    }

    const project = await this.prisma.project.create({ data: createData });

    // Automatically assign the user who created it to the project so it appears in their inventory
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      const roleCode = user?.role?.code || 'CHANNEL_PARTNER';
      await this.prisma.projectAssignment.create({
        data: {
          projectId: project.id,
          userId,
          role: roleCode
        }
      });

      // Notification #16: Project Assigned to Sourcing / Closing Manager
      if (['SOURCING_MANAGER', 'CLOSING_MANAGER'].includes(roleCode)) {
        await this.notificationsService.createNotification({
          userId: userId,
          type: NotificationType.PROJECT_ASSIGNED,
          title: "You have been assigned to a new project.",
          body: `${project.name} — CP Project. You are now assigned as ${roleCode.replace('_', ' ')}.`,
          actionUrl: `/dashboard/${roleCode.toLowerCase().replace('_', '-')}/index`,
          metadata: {
            projectId: project.id,
            projectName: project.name,
            assignedRole: roleCode,
          }
        });
      }
    }

    return project;
  }

  async getProjectTowers(projectId: string, userId?: string) {
    let sourcingManagerTowerIds: string[] | null = null;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      if (user?.role?.code === 'SOURCING_MANAGER' || user?.role?.code === 'CLOSING_MANAGER') {
        const projectAssignment = await this.prisma.projectAssignment.findUnique({
          where: { projectId_userId: { projectId, userId } }
        });

        if (!projectAssignment) {
          const assignments = await this.prisma.towerAssignment.findMany({
            where: { userId }
          });
          sourcingManagerTowerIds = assignments.map(a => a.towerId);
        }
      }
    }

    const whereClause: any = { projectId };
    if (sourcingManagerTowerIds !== null) {
      whereClause.id = { in: sourcingManagerTowerIds };
    }

    return this.prisma.tower.findMany({
      where: whereClause,
      include: {
        floors: {
          include: {
            units: {
              orderBy: { unitNumber: 'asc' },
              include: {
                bookings: {
                  where: { status: { notIn: ['CANCELLED'] } },
                  include: {
                    customer: true,
                    loanCase: true,
                    agreement: true,
                    possession: true
                  },
                  take: 1
                }
              }
            }
          },
          orderBy: { floorNumber: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async assignTower(towerId: string, sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds: string[] = []) {
    // Delete existing assignments for this tower for SM, CM, and SE roles
    await this.prisma.towerAssignment.deleteMany({
      where: {
        towerId,
        role: { in: ['SOURCING_MANAGER', 'CLOSING_MANAGER', 'SALES_EXECUTIVE'] }
      }
    });

    const data = [
      ...sourcingManagerIds.map(id => ({ towerId, userId: id, role: 'SOURCING_MANAGER' })),
      ...closingManagerIds.map(id => ({ towerId, userId: id, role: 'CLOSING_MANAGER' })),
      ...salesExecIds.map(id => ({ towerId, userId: id, role: 'SALES_EXECUTIVE' }))
    ];

    if (data.length > 0) {
      await this.prisma.towerAssignment.createMany({ data });
    }
    return { success: true };
  }

  async getTowerAssignments(towerId: string) {
    return this.prisma.towerAssignment.findMany({
      where: { towerId },
      include: { user: { select: { id: true, name: true, role: { select: { code: true } } } } }
    });
  }

  async assignProject(projectId: string, sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds: string[] = []) {
    await this.prisma.projectAssignment.deleteMany({
      where: {
        projectId,
        role: { in: ['SOURCING_MANAGER', 'CLOSING_MANAGER', 'SALES_EXECUTIVE'] }
      }
    });

    const data = [
      ...sourcingManagerIds.map(id => ({ projectId, userId: id, role: 'SOURCING_MANAGER' })),
      ...closingManagerIds.map(id => ({ projectId, userId: id, role: 'CLOSING_MANAGER' })),
      ...salesExecIds.map(id => ({ projectId, userId: id, role: 'SALES_EXECUTIVE' }))
    ];

    if (data.length > 0) {
      await this.prisma.projectAssignment.createMany({ data });

      // Notification #16: Project Assigned to Sourcing / Closing Manager
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (project) {
        for (const id of sourcingManagerIds) {
          await this.notificationsService.createNotification({
            userId: id,
            type: NotificationType.PROJECT_ASSIGNED,
            title: "You have been assigned to a new project.",
            body: `${project.name} — CP Project. You are now assigned as Sourcing Manager.`,
            actionUrl: `/dashboard/sourcing-manager/index`,
            metadata: {
              projectId: project.id,
              projectName: project.name,
              assignedRole: 'SOURCING_MANAGER',
            }
          });
        }
        for (const id of closingManagerIds) {
          await this.notificationsService.createNotification({
            userId: id,
            type: NotificationType.PROJECT_ASSIGNED,
            title: "You have been assigned to a new project.",
            body: `${project.name} — CP Project. You are now assigned as Closing Manager.`,
            actionUrl: `/dashboard/closing-manager/index`,
            metadata: {
              projectId: project.id,
              projectName: project.name,
              assignedRole: 'CLOSING_MANAGER',
            }
          });
        }
      }
    }
    return { success: true };
  }

  async getProjectAssignments(projectId: string) {
    return this.prisma.projectAssignment.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, role: { select: { code: true } } } } }
    });
  }
}

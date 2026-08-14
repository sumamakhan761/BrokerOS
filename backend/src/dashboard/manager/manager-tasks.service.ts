import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class ManagerTasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new active task and assigns it to specified employees (or all subordinates).
   * Rule: an employee can only have ONE active task assignment at a time.
   */
  async createTask(managerId: string, data: { coldCallTarget: number; assignToAll: boolean; userIds?: string[] }) {
    let targetUserIds: string[];

    if (data.assignToAll) {
      const subs = await this.prisma.user.findMany({
        where: { managerId, status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      });
      targetUserIds = subs.map((s) => s.id);
    } else {
      targetUserIds = data.userIds ?? [];
    }

    if (targetUserIds.length === 0) {
      throw new BadRequestException('No employees to assign the task to.');
    }

    // Check none of the targets already have an active assignment
    const existingAssignments = await this.prisma.managerTaskUser.findMany({
      where: {
        userId: { in: targetUserIds },
        task: { isActive: true },
      },
      select: { userId: true },
    });

    if (existingAssignments.length > 0) {
      const alreadyAssigned = existingAssignments.map((a) => a.userId);
      throw new BadRequestException(
        `The following employees already have an active task: ${alreadyAssigned.join(', ')}. Delete their existing task first.`,
      );
    }

    // Create task with all assignees
    return this.prisma.managerTask.create({
      data: {
        managerId,
        coldCallTarget: data.coldCallTarget,
        isActive: true,
        assignees: {
          create: targetUserIds.map((userId) => ({ userId })),
        },
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, username: true } } },
        },
      },
    });
  }

  /**
   * Updates the cold call target or the backlog override for a specific employee on a task.
   * - coldCallTarget: can increase or decrease
   * - backlogOverride: manager can only set it to a value <= current computed backlog (decrease only enforced in UI)
   */
  async updateTask(
    taskId: string,
    managerId: string,
    data: { coldCallTarget?: number; userId?: string; backlogOverride?: number },
  ) {
    const task = await this.prisma.managerTask.findUnique({
      where: { id: taskId },
      select: { managerId: true, isActive: true },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.managerId !== managerId) throw new ForbiddenException('Not your task');
    if (!task.isActive) throw new BadRequestException('Task is no longer active');

    // Update cold call target on the task itself or as a specific user override
    if (data.coldCallTarget !== undefined) {
      if (data.userId) {
        await this.prisma.managerTaskUser.updateMany({
          where: { taskId, userId: data.userId },
          data: { targetOverride: data.coldCallTarget },
        });
      } else {
        await this.prisma.managerTask.update({
          where: { id: taskId },
          data: { coldCallTarget: data.coldCallTarget },
        });
      }
    }

    // Update backlog override for a specific employee
    if (data.userId !== undefined && data.backlogOverride !== undefined) {
      await this.prisma.managerTaskUser.updateMany({
        where: { taskId, userId: data.userId },
        data: { backlogOverride: data.backlogOverride },
      });
    }

    return this.getActiveTasks(managerId);
  }

  /** Soft-deletes a task by setting isActive = false */
  async deleteTask(taskId: string, managerId: string) {
    const task = await this.prisma.managerTask.findUnique({
      where: { id: taskId },
      select: { managerId: true },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.managerId !== managerId) throw new ForbiddenException('Not your task');

    await this.prisma.managerTask.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /** Lists all active tasks created by this manager with their assignees */
  async getActiveTasks(managerId: string) {
    return this.prisma.managerTask.findMany({
      where: { managerId, isActive: true },
      include: {
        assignees: {
          include: { user: { select: { id: true, name: true, username: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Called by the pre-sales user to get their active cold call target.
   * Returns null if no task is assigned (caller should fall back to default 100).
   */
  async getMyTask(userId: string) {
    const assignment = await this.prisma.managerTaskUser.findFirst({
      where: {
        userId,
        task: { isActive: true },
      },
      include: {
        task: { select: { coldCallTarget: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!assignment) return { coldCallTarget: 100, backlogOverride: null, hasTask: false };

    return {
      coldCallTarget: assignment.task.coldCallTarget,
      backlogOverride: assignment.backlogOverride,
      hasTask: true,
      taskUserId: assignment.id,
    };
  }
}

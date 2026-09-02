import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '@brokeros/prisma';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from '../core/dto/dashboard.dto.js';

@Injectable()
export class ManagerAnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createAnnouncement(managerId: string, data: CreateAnnouncementDto) {
    const ann = await this.prisma.announcement.create({
      data: {
        managerId,
        title: data.title,
        description: data.description,
        isActive: true,
      },
    });

    // Fetch Manager Info
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      select: { name: true, role: { select: { code: true } } },
    });

    if (manager) {
      // Find all employees directly reporting to this manager
      const employees = await this.prisma.user.findMany({
        where: { managerId, status: 'ACTIVE' },
        select: { id: true, role: { select: { code: true } } },
      });

      const preview =
        data.description.length > 100
          ? data.description.substring(0, 100) + '...'
          : data.description;

      for (const emp of employees) {
        // Construct the dashboard route specific to the employee's role
        const roleRoute =
          (emp as any).role?.code?.toLowerCase().replace(/_/g, '-') ||
          'pre-sales';

        await this.notificationsService.createNotification({
          userId: emp.id,
          type: NotificationType.ANNOUNCEMENT,
          title: 'New announcement from your manager.',
          body: preview,
          actionUrl: `/dashboard/${roleRoute}`,
          metadata: {
            managerId,
            managerName: manager.name,
            announcementId: ann.id,
            preview,
          },
        });
      }
    }

    return ann;
  }

  async updateAnnouncement(
    id: string,
    managerId: string,
    data: UpdateAnnouncementDto,
  ) {
    const ann = await this.prisma.announcement.findUnique({
      where: { id },
      select: { managerId: true },
    });
    if (!ann) throw new NotFoundException('Announcement not found');
    if (ann.managerId !== managerId)
      throw new ForbiddenException('Not your announcement');

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });
  }

  /** Immediately deletes the announcement completely */
  async deleteAnnouncement(id: string, managerId: string) {
    const ann = await this.prisma.announcement.findUnique({
      where: { id },
      select: { managerId: true },
    });
    if (!ann) throw new NotFoundException('Announcement not found');
    if (ann.managerId !== managerId)
      throw new ForbiddenException('Not your announcement');

    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }

  /** Manager views all their active announcements */
  async getManagerAnnouncements(managerId: string) {
    return this.prisma.announcement.findMany({
      where: { managerId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Employee fetches active announcements from their direct manager.
   * Returns empty array if the employee has no manager or no active announcements.
   */
  async getMyAnnouncements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { managerId: true },
    });

    if (!user?.managerId) return [];

    return this.prisma.announcement.findMany({
      where: { managerId: user.managerId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, createdAt: true },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { MessageAttachmentDto } from './dto/chat.dto.js';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Evaluates the hierarchical rules and returns users this user is allowed to chat with.
   */
  async getValidContacts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleCode = user.role?.code;
    const allowedUserIds = new Set<string>();

    // 1. Managers & Subordinates (Pre-Sales & Sales generic)
    // You can always talk to your manager
    if (user.managerId) {
      allowedUserIds.add(user.managerId);
    }
    // And you can always talk to your subordinates
    const subordinates = await this.prisma.user.findMany({
      where: { managerId: user.id },
      select: { id: true },
    });
    subordinates.forEach((sub) => allowedUserIds.add(sub.id));

    // Role specific cross-department rules
    switch (roleCode) {
      case 'PRE_SALES_MANAGER': {
        // Can talk to Sales Managers
        const smUsers = await this.prisma.user.findMany({
          where: { role: { code: 'SALES_MANAGER' } },
          select: { id: true },
        });
        smUsers.forEach((u) => allowedUserIds.add(u.id));

        // Also Pre-Sales Execs would be caught by the subordinate check above.
        break;
      }
      case 'SALES_MANAGER': {
        // Can talk to Pre-Sales Managers
        const psmUsers = await this.prisma.user.findMany({
          where: { role: { code: 'PRE_SALES_MANAGER' } },
          select: { id: true },
        });
        psmUsers.forEach((u) => allowedUserIds.add(u.id));
        break;
      }
      case 'POST_SALES':
      case 'CLOSING_MANAGER': {
        // Post-Sales / Closing Manager can chat with Sales Manager, Sales Exec, Pre-Sales Manager
        const targetRoles = [
          'SALES_MANAGER',
          'SALES_EXECUTIVE',
          'PRE_SALES_MANAGER',
        ];
        const targets = await this.prisma.user.findMany({
          where: { role: { code: { in: targetRoles } } },
          select: { id: true },
        });
        targets.forEach((u) => allowedUserIds.add(u.id));

        // Channel Partner acts as manager to CM, and if CM and SM share project, they can chat.
        // Let's get SMs on the same project
        const myProjects = await this.prisma.projectAssignment.findMany({
          where: { userId: user.id, isActive: true },
          select: { projectId: true },
        });
        const projectIds = myProjects.map((p) => p.projectId);

        if (projectIds.length > 0) {
          const sameProjectSms = await this.prisma.projectAssignment.findMany({
            where: {
              projectId: { in: projectIds },
              isActive: true,
              user: { role: { code: 'SOURCING_MANAGER' } },
            },
            select: { userId: true },
          });
          sameProjectSms.forEach((sm) => allowedUserIds.add(sm.userId));
        }

        // CM can talk to their CP manager (assumed to be via project assignment or just all CPs?)
        // Let's allow CM to talk to all CPs for simplicity, or we check if there's a CP manager relation.
        const cps = await this.prisma.user.findMany({
          where: { role: { code: 'CHANNEL_PARTNER' } },
          select: { id: true },
        });
        cps.forEach((cp) => allowedUserIds.add(cp.id));

        break;
      }
      case 'CHANNEL_PARTNER': {
        // CP can talk to all Sourcing Managers and Closing Managers
        const smCmUsers = await this.prisma.user.findMany({
          where: {
            role: { code: { in: ['SOURCING_MANAGER', 'CLOSING_MANAGER'] } },
          },
          select: { id: true },
        });
        smCmUsers.forEach((u) => allowedUserIds.add(u.id));
        break;
      }
      case 'SOURCING_MANAGER': {
        // SM can talk to CPs
        const cps = await this.prisma.user.findMany({
          where: { role: { code: 'CHANNEL_PARTNER' } },
          select: { id: true },
        });
        cps.forEach((cp) => allowedUserIds.add(cp.id));

        // SM can talk to CMs if on same project
        const myProjects = await this.prisma.projectAssignment.findMany({
          where: { userId: user.id, isActive: true },
          select: { projectId: true },
        });
        const projectIds = myProjects.map((p) => p.projectId);

        if (projectIds.length > 0) {
          const sameProjectCms = await this.prisma.projectAssignment.findMany({
            where: {
              projectId: { in: projectIds },
              isActive: true,
              user: { role: { code: 'CLOSING_MANAGER' } },
            },
            select: { userId: true },
          });
          sameProjectCms.forEach((cm) => allowedUserIds.add(cm.userId));
        }
        break;
      }
    }

    allowedUserIds.delete(userId); // ensure not chatting with self

    // Fetch full profiles of allowed users
    const validContacts = await this.prisma.user.findMany({
      where: { id: { in: Array.from(allowedUserIds) } },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: { select: { name: true, code: true } },
      },
    });

    return validContacts;
  }

  /**
   * Gets all chat rooms for a user, sorted by last message.
   */
  async getChatRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: { select: { code: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Compute unread counts manually for now (can be optimized in raw SQL for large scale)
    const result = await Promise.all(
      rooms.map(async (room) => {
        const myMembership = room.members.find((m) => m.userId === userId);
        let unreadCount = 0;

        if (myMembership) {
          unreadCount = await this.prisma.chatMessage.count({
            where: {
              chatRoomId: room.id,
              createdAt: { gt: myMembership.lastReadAt || new Date(0) },
              senderId: { not: userId },
            },
          });
        }

        // If it's a direct chat, determine the "other" person to show as room name/avatar
        let computedName = room.name;
        let computedAvatar = room.avatarUrl;

        if (room.type === 'DIRECT') {
          const otherMember = room.members.find((m) => m.userId !== userId);
          if (otherMember) {
            computedName = otherMember.user.name || 'Unknown User';
            computedAvatar = otherMember.user.image;
          }
        }

        return {
          id: room.id,
          type: room.type,
          name: computedName,
          avatarUrl: computedAvatar,
          lastMessage: room.messages[0] || null,
          unreadCount,
          members: room.members.map((m) => m.user),
        };
      }),
    );

    // Sort by last message date
    return result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });
  }

  /**
   * Get or create a direct chat room between two users.
   */
  async getOrCreateDirectRoom(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot chat with yourself');
    }

    // Verify they are allowed to chat
    const validContacts = await this.getValidContacts(userId);
    if (!validContacts.find((u) => u.id === targetUserId)) {
      throw new ForbiddenException(
        'You are not permitted to chat with this user directly based on role hierarchy',
      );
    }

    // Find existing direct room
    // A DIRECT room must have exactly these two users.
    const existingRooms = await this.prisma.chatRoom.findMany({
      where: {
        type: 'DIRECT',
        members: {
          every: { userId: { in: [userId, targetUserId] } },
        },
      },
      include: { members: true },
    });

    // Filter to ensure exactly two members (prisma 'every' doesn't enforce length)
    const existingRoom = existingRooms.find(
      (r) =>
        r.members.length === 2 &&
        r.members.some((m) => m.userId === userId) &&
        r.members.some((m) => m.userId === targetUserId),
    );

    if (existingRoom) {
      return existingRoom;
    }

    // Create new room
    const newRoom = await this.prisma.chatRoom.create({
      data: {
        type: 'DIRECT',
        createdById: userId,
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: { members: true },
    });

    return newRoom;
  }

  async getMessages(roomId: string, cursor?: string, limit: number = 20) {
    const args: any = {
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const messages = await this.prisma.chatMessage.findMany(args);
    return messages; // they are in desc order, client may reverse
  }

  async sendMessage(
    userId: string,
    roomId: string,
    content?: string,
    attachment?: MessageAttachmentDto,
  ) {
    // Verify membership
    const membership = await this.prisma.chatRoomMember.findUnique({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this chat room');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        chatRoomId: roomId,
        senderId: userId,
        content: content || '',
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Also update sender's last read at so their unread count stays 0
    await this.markAsRead(userId, roomId);

    return message;
  }

  async markAsRead(userId: string, roomId: string) {
    return this.prisma.chatRoomMember.update({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      data: { lastReadAt: new Date() },
    });
  }
}

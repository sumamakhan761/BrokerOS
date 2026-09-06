import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type {
  CreateWhatsAppQuickReplyDto,
  UpdateWhatsAppQuickReplyDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppQuickRepliesService {
  private readonly prisma = prismaClient;

  async listQuickReplies(accountId?: string) {
    const where: Record<string, any> = {};
    if (accountId) where.accountId = accountId;

    return this.prisma.whatsAppQuickReply.findMany({
      where,
      orderBy: { shortcut: 'asc' },
    });
  }

  async createQuickReply(dto: CreateWhatsAppQuickReplyDto) {
    let accountId = dto.accountId;
    if (!accountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      if (!defaultAccount) {
        throw new BadRequestException(
          'No active WhatsApp business account found',
        );
      }
      accountId = defaultAccount.id;
    }

    const shortcut = dto.shortcut.startsWith('/')
      ? dto.shortcut
      : `/${dto.shortcut}`;

    return this.prisma.whatsAppQuickReply.upsert({
      where: {
        accountId_shortcut: { accountId, shortcut },
      },
      create: {
        accountId,
        shortcut,
        content: dto.content,
      },
      update: {
        content: dto.content,
      },
    });
  }

  async updateQuickReply(id: string, dto: UpdateWhatsAppQuickReplyDto) {
    const existing = await this.prisma.whatsAppQuickReply.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Quick reply ${id} not found`);
    }

    const shortcut = dto.shortcut
      ? dto.shortcut.startsWith('/')
        ? dto.shortcut
        : `/${dto.shortcut}`
      : undefined;

    return this.prisma.whatsAppQuickReply.update({
      where: { id },
      data: {
        shortcut,
        content: dto.content !== undefined ? dto.content : undefined,
      },
    });
  }

  async deleteQuickReply(id: string) {
    await this.prisma.whatsAppQuickReply.delete({
      where: { id },
    });
    return { success: true, message: 'Quick reply deleted' };
  }
}

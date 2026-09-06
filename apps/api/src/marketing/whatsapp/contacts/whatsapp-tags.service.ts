import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type { CreateWhatsAppTagDto } from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppTagsService {
  private readonly prisma = prismaClient;

  async listTags(accountId?: string) {
    const where: Record<string, any> = {};
    if (accountId) where.accountId = accountId;

    return this.prisma.whatsAppTag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    });
  }

  async createTag(dto: CreateWhatsAppTagDto) {
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

    return this.prisma.whatsAppTag.upsert({
      where: {
        accountId_name: { accountId, name: dto.name.trim() },
      },
      create: {
        accountId,
        name: dto.name.trim(),
        color: dto.color || '#3B82F6',
      },
      update: {
        color: dto.color || undefined,
      },
    });
  }

  async deleteTag(id: string) {
    await this.prisma.whatsAppTag.delete({
      where: { id },
    });
    return { success: true, message: 'Tag deleted' };
  }

  async addTag(contactId: string, tagId: string) {
    const contact = await this.prisma.whatsAppContact.findUnique({
      where: { id: contactId },
    });
    if (!contact) throw new NotFoundException(`Contact ${contactId} not found`);

    const tag = await this.prisma.whatsAppTag.findUnique({
      where: { id: tagId },
    });
    if (!tag) throw new NotFoundException(`Tag ${tagId} not found`);

    return this.prisma.whatsAppContactTag.upsert({
      where: {
        contactId_tagId: { contactId, tagId },
      },
      create: {
        contactId,
        tagId,
      },
      update: {},
    });
  }

  async removeTag(contactId: string, tagId: string) {
    await this.prisma.whatsAppContactTag.deleteMany({
      where: { contactId, tagId },
    });
    return { success: true, message: 'Tag removed from contact' };
  }
}

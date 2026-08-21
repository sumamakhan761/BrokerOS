import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { put } from '@vercel/blob';

@Injectable()
export class LeadsMediaService {
  constructor(private prisma: PrismaService) {}

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    const blob = await put(`avatars/${id}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return this.prisma.lead.update({
      where: { id },
      data: {
        avatar: blob.url,
      },
    });
  }
}

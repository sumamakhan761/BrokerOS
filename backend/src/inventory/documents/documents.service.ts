import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { put } from '@vercel/blob';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) { }

  async uploadDocument(projectId: string, towerId: string | null, file: any, title: string, category: string, isPublic: boolean) {
    if (!file) throw new Error("File is required");

    // Upload to Vercel Blob with project prefix to keep it organized (like bookings)
    const blob = await put(`projects/${projectId}/${category}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Save to DB
    return this.prisma.projectDocument.create({
      data: {
        projectId,
        towerId: towerId || null,
        title,
        category,
        fileUrl: blob.url,
        fileType: file.mimetype,
        fileSize: file.size,
        isPublic: String(isPublic) === 'true' || isPublic === true,
      }
    });
  }

  async getDocuments(projectId: string, towerId?: string) {
    const whereClause: any = { projectId };
    if (towerId) {
      whereClause.towerId = towerId;
    }

    return this.prisma.projectDocument.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDocument(id: string) {
    return this.prisma.projectDocument.findUnique({
      where: { id }
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.projectDocument.delete({
      where: { id }
    });
  }
}

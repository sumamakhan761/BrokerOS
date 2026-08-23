import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { put } from '@vercel/blob';

@Injectable()
export class BookingDocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(bookingId: string, docType: string, file: Express.Multer.File, description?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const blob = await put(`bookings/${bookingId}/${docType}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return this.prisma.customerDocument.create({
      data: {
        customerId: booking.customerId,
        type: docType as any,
        fileUrl: blob.url,
        title: file.originalname,
        description: description,
        bookingId: bookingId,
        verificationStatus: 'PENDING',
      }
    });
  }

  async getDocumentFile(documentId: string) {
    const doc = await this.prisma.customerDocument.findUnique({ where: { id: documentId } });
    if (!doc) return null;
    return doc;
  }
}

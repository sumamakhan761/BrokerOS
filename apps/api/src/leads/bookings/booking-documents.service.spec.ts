import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'http://example.com/blob' }),
}));

import { BookingDocumentsService } from './booking-documents.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('BookingDocumentsService', () => {
  let service: BookingDocumentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: { findUnique: jest.fn() },
    customerDocument: { create: jest.fn(), findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingDocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(BookingDocumentsService);
    prisma = module.get(PrismaService);
  });

  it('should upload doc', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: 'b-1',
      customerId: 'c-1',
    });
    mockPrisma.customerDocument.create.mockResolvedValue({ id: 'd-1' });
    const res = await service.uploadDocument('b-1', 'ID', {
      buffer: Buffer.from(''),
      originalname: 'test.jpg',
    } as Express.Multer.File);
    expect(res).toEqual({ id: 'd-1' });
  });

  it('should get doc', async () => {
    mockPrisma.customerDocument.findUnique.mockResolvedValue({ id: 'd-1' });
    expect(await service.getDocumentFile('d-1')).toEqual({ id: 'd-1' });
  });
});

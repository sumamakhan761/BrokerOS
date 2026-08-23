import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class { } }));
jest.mock('expo-server-sdk', () => ({ Expo: class { } }));
jest.mock('@vercel/blob', () => ({ put: jest.fn().mockResolvedValue({ url: 'url' }) }));

import { DocumentsService } from './documents.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { UploadDocumentDto } from './dto/document.dto.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  const mockPrisma = { projectDocument: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(DocumentsService);
  });

  it('should upload document', async () => {
    mockPrisma.projectDocument.create.mockResolvedValue({ id: 'd-1' });
    const dto = {
      towerId: undefined,
      title: 'Title',
      category: 'Cat',
      isPublic: true,
    } as UploadDocumentDto;
    const res = await service.uploadDocument('p-1', { buffer: Buffer.from(''), originalname: 'test.pdf', mimetype: 'application/pdf', size: 100 }, dto);
    expect(res.id).toBe('d-1');
  });
});

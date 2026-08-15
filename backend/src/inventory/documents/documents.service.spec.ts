import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@vercel/blob', () => ({ put: jest.fn().mockResolvedValue({ url: 'url' }) }));

import { DocumentsService } from './documents.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

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
    const res = await service.uploadDocument('p-1', null, { buffer: Buffer.from(''), originalname: 'test.pdf' }, 'Title', 'Cat', true);
    expect(res.id).toBe('d-1');
  });
});

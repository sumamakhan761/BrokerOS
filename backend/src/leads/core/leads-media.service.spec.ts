import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@vercel/blob', () => ({ put: jest.fn().mockResolvedValue({ url: 'url' }) }));

import { LeadsMediaService } from './leads-media.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('LeadsMediaService', () => {
  let service: LeadsMediaService;
  const mockPrisma = { lead: { findUnique: jest.fn(), update: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsMediaService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(LeadsMediaService);
  });

  it('should upload avatar', async () => {
    mockPrisma.lead.findUnique.mockResolvedValue({ id: 'l-1' });
    mockPrisma.lead.update.mockResolvedValue({ id: 'l-1', avatar: 'url' });
    const res = await service.uploadAvatar('l-1', { buffer: Buffer.from(''), originalname: 'test.jpg' });
    expect(res.avatar).toBe('url');
  });
});

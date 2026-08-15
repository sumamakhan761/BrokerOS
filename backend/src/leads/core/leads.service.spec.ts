import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class { } }));
jest.mock('expo-server-sdk', () => ({ Expo: class { } }));
import { LeadsService } from './leads.service.js';
import { LeadsQueryService } from './leads-query.service.js';
import { LeadsManagementService } from './leads-management.service.js';
import { LeadsMediaService } from './leads-media.service.js';

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: LeadsQueryService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: LeadsManagementService, useValue: { bulkCreate: jest.fn(), assignLeads: jest.fn(), updateStatus: jest.fn(), create: jest.fn(), update: jest.fn() } },
        { provide: LeadsMediaService, useValue: { uploadAvatar: jest.fn() } },
      ],
    }).compile();

    service = module.get(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

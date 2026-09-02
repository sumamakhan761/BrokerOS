import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {},
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {},
}));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {},
  PrismaClient: class {},
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { BusinessManagerLeadsService } from './business-manager-leads.service.js';

describe('BusinessManagerLeadsService', () => {
  let service: BusinessManagerLeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagerLeadsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessManagerLeadsService>(
      BusinessManagerLeadsService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

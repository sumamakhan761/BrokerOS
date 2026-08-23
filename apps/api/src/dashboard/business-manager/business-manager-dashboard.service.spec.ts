import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {}
}));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {},
  PrismaClient: class {}
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { BusinessManagerDashboardService } from './business-manager-dashboard.service.js';

describe('BusinessManagerDashboardService', () => {
  let service: BusinessManagerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagerDashboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessManagerDashboardService>(BusinessManagerDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

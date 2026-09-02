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
import { PreSalesAnalyticsService } from './pre-sales-analytics.service.js';

describe('PreSalesAnalyticsService', () => {
  let service: PreSalesAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesAnalyticsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesAnalyticsService>(PreSalesAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

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
import { SalesManagerAnalyticsService } from './sales-manager-analytics.service.js';

describe('SalesManagerAnalyticsService', () => {
  let service: SalesManagerAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesManagerAnalyticsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesManagerAnalyticsService>(SalesManagerAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

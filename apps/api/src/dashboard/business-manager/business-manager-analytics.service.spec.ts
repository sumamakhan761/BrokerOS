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
import { BusinessManagerAnalyticsService } from './business-manager-analytics.service.js';

describe('BusinessManagerAnalyticsService', () => {
  let service: BusinessManagerAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagerAnalyticsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessManagerAnalyticsService>(BusinessManagerAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

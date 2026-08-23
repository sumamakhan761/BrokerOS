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
import { SalesExecAnalyticsService } from './sales-exec-analytics.service.js';

describe('SalesExecAnalyticsService', () => {
  let service: SalesExecAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesExecAnalyticsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesExecAnalyticsService>(SalesExecAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

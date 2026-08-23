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
import { ClosingManagerAnalyticsService } from './closing-manager-analytics.service.js';

describe('ClosingManagerAnalyticsService', () => {
  let service: ClosingManagerAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClosingManagerAnalyticsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ClosingManagerAnalyticsService>(ClosingManagerAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

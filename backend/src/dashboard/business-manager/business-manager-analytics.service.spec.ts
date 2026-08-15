import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {}
}));

import { BusinessManagerAnalyticsService } from './business-manager-analytics.service.js';

describe('BusinessManagerAnalyticsService', () => {
  let service: BusinessManagerAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerAnalyticsService],
    }).compile();

    service = module.get<BusinessManagerAnalyticsService>(BusinessManagerAnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {}
}));

import { BusinessManagerFinancialsService } from './business-manager-financials.service.js';

describe('BusinessManagerFinancialsService', () => {
  let service: BusinessManagerFinancialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerFinancialsService],
    }).compile();

    service = module.get<BusinessManagerFinancialsService>(BusinessManagerFinancialsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {}
}));

import { BusinessManagerLeadsService } from './business-manager-leads.service.js';

describe('BusinessManagerLeadsService', () => {
  let service: BusinessManagerLeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerLeadsService],
    }).compile();

    service = module.get<BusinessManagerLeadsService>(BusinessManagerLeadsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

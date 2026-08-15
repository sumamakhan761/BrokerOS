import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {}
}));

import { BusinessManagerInventoryService } from './business-manager-inventory.service.js';

describe('BusinessManagerInventoryService', () => {
  let service: BusinessManagerInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerInventoryService],
    }).compile();

    service = module.get<BusinessManagerInventoryService>(BusinessManagerInventoryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

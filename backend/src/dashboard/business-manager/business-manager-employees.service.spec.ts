import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {}
}));

import { BusinessManagerEmployeesService } from './business-manager-employees.service.js';

describe('BusinessManagerEmployeesService', () => {
  let service: BusinessManagerEmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerEmployeesService],
    }).compile();

    service = module.get<BusinessManagerEmployeesService>(BusinessManagerEmployeesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

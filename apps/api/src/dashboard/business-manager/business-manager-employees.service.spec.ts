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
import { BusinessManagerEmployeesService } from './business-manager-employees.service.js';

describe('BusinessManagerEmployeesService', () => {
  let service: BusinessManagerEmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagerEmployeesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessManagerEmployeesService>(BusinessManagerEmployeesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

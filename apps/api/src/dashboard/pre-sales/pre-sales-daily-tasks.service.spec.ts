import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {},
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {},
}));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {},
  PrismaClient: class {},
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { PreSalesDailyTasksService } from './pre-sales-daily-tasks.service.js';

describe('PreSalesDailyTasksService', () => {
  let service: PreSalesDailyTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesDailyTasksService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesDailyTasksService>(PreSalesDailyTasksService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

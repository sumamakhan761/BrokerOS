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
import { SalesManagerDailyTasksService } from './sales-manager-daily-tasks.service.js';

describe('SalesManagerDailyTasksService', () => {
  let service: SalesManagerDailyTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesManagerDailyTasksService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesManagerDailyTasksService>(
      SalesManagerDailyTasksService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

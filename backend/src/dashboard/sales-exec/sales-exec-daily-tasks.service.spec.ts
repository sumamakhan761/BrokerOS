import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {},
  PrismaClient: class {}
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { SalesExecDailyTasksService } from './sales-exec-daily-tasks.service.js';

describe('SalesExecDailyTasksService', () => {
  let service: SalesExecDailyTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesExecDailyTasksService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesExecDailyTasksService>(SalesExecDailyTasksService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

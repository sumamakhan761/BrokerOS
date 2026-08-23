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
import { SalesExecDashboardService } from './sales-exec-dashboard.service.js';
import { SalesExecWidgetsService } from './sales-exec-widgets.service.js';
import { SalesExecDailyTasksService } from './sales-exec-daily-tasks.service.js';
describe('SalesExecDashboardService', () => {
  let service: SalesExecDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesExecDashboardService,
        { provide: SalesExecWidgetsService, useValue: {} },
        { provide: SalesExecDailyTasksService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesExecDashboardService>(SalesExecDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

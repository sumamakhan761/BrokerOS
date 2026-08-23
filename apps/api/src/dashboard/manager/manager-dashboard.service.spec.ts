import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class { }
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {},
  PrismaClient: class { }
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { ManagerDashboardService } from './manager-dashboard.service.js';

describe('ManagerDashboardService', () => {
  let service: ManagerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerDashboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ManagerDashboardService>(ManagerDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

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
import { ClosingManagerDashboardService } from './closing-manager-dashboard.service.js';

describe('ClosingManagerDashboardService', () => {
  let service: ClosingManagerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClosingManagerDashboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ClosingManagerDashboardService>(ClosingManagerDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

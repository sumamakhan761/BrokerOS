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
import { PreSalesWidgetsService } from './pre-sales-widgets.service.js';

describe('PreSalesWidgetsService', () => {
  let service: PreSalesWidgetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesWidgetsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesWidgetsService>(PreSalesWidgetsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

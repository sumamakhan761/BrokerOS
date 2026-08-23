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
import { SalesManagerWidgetsService } from './sales-manager-widgets.service.js';

describe('SalesManagerWidgetsService', () => {
  let service: SalesManagerWidgetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesManagerWidgetsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesManagerWidgetsService>(SalesManagerWidgetsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

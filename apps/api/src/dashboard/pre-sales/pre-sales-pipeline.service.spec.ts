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
import { PreSalesPipelineService } from './pre-sales-pipeline.service.js';

describe('PreSalesPipelineService', () => {
  let service: PreSalesPipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesPipelineService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesPipelineService>(PreSalesPipelineService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

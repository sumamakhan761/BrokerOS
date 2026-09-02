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
import { BusinessManagerFinancialsService } from './business-manager-financials.service.js';

describe('BusinessManagerFinancialsService', () => {
  let service: BusinessManagerFinancialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagerFinancialsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessManagerFinancialsService>(
      BusinessManagerFinancialsService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

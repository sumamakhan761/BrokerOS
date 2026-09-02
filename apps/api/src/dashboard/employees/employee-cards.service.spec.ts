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
import { EmployeeCardsService } from './employee-cards.service.js';

describe('EmployeeCardsService', () => {
  let service: EmployeeCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeCardsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<EmployeeCardsService>(EmployeeCardsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

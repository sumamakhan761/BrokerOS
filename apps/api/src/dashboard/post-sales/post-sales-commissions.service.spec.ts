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
import { PostSalesCommissionsService } from './post-sales-commissions.service.js';

describe('PostSalesCommissionsService', () => {
  let service: PostSalesCommissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostSalesCommissionsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PostSalesCommissionsService>(
      PostSalesCommissionsService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

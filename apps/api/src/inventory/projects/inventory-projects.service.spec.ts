import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ NotificationType: { PROJECT_ASSIGNED: 'PROJECT_ASSIGNED' }, PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');

import { InventoryProjectsService } from './inventory-projects.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { ProjectQueryDto } from './dto/project.dto.js';

describe('InventoryProjectsService', () => {
  let service: InventoryProjectsService;
  const mockPrisma = {
    user: { findUnique: jest.fn() },
    project: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    projectAssignment: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
    towerAssignment: { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
    tower: { findMany: jest.fn() },
  };
  const mockNotifs = { createNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifs },
      ],
    }).compile();
    service = module.get(InventoryProjectsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get projects', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', role: { code: 'ADMIN' } });
    mockPrisma.project.findMany.mockResolvedValue([{ id: 'p-1' }]);
    const query = {} as ProjectQueryDto;
    const res = await service.getProjects(query, 'u-1');
    expect(res.length).toBe(1);
  });
});

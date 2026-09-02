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
jest.mock('expo-server-sdk', () => ({
  Expo: class {
    sendPushNotificationsAsync = jest.fn();
    chunkPushNotifications = jest.fn();
  },
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { EmployeesService } from './employees.service.js';
import { EmployeeCardsService } from './employee-cards.service.js';
import { ManagerTasksService } from '../manager/manager-tasks.service.js';
import { ManagerAnnouncementsService } from '../manager/manager-announcements.service.js';
describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: {} },
        { provide: EmployeeCardsService, useValue: {} },
        { provide: ManagerTasksService, useValue: {} },
        { provide: ManagerAnnouncementsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

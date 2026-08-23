import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { ChatService } from './chat.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageAttachmentDto } from './dto/chat.dto.js';

describe('ChatService', () => {
  let service: ChatService;
  const mockPrisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
    chatRoom: { findMany: jest.fn(), create: jest.fn() },
    chatMessage: { count: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    chatRoomMember: { findUnique: jest.fn(), update: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(ChatService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw NotFoundException if user not found in valid contacts', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getValidContacts('u-1')).rejects.toThrow(NotFoundException);
  });

  it('should return valid contacts for manager', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', managerId: 'm-1', role: { code: 'PRE_SALES_MANAGER' } });
    mockPrisma.user.findMany.mockImplementation(async (args) => {
      if (args.where?.managerId === 'u-1') return [{ id: 'sub-1' }];
      if (args.where?.role?.code === 'SALES_MANAGER') return [{ id: 'sm-1' }];
      if (args.where?.id) return [{ id: 'm-1' }, { id: 'sub-1' }, { id: 'sm-1' }];
      return [];
    });
    const res = await service.getValidContacts('u-1');
    expect(res.length).toBeGreaterThan(0);
  });

  it('should get chat rooms', async () => {
    mockPrisma.chatRoom.findMany.mockResolvedValue([{
      id: 'r-1', type: 'DIRECT', members: [{ userId: 'u-1', user: { name: 'Me' } }, { userId: 'u-2', user: { name: 'Them' } }], messages: []
    }]);
    mockPrisma.chatMessage.count.mockResolvedValue(0);
    const res = await service.getChatRooms('u-1');
    expect(res.length).toBe(1);
    expect(res[0].name).toBe('Them');
  });

  it('should get or create direct room', async () => {
    jest.spyOn(service, 'getValidContacts').mockResolvedValue([{ id: 'u-2' }] as any);
    mockPrisma.chatRoom.findMany.mockResolvedValue([]);
    mockPrisma.chatRoom.create.mockResolvedValue({ id: 'new-room' });

    const res = await service.getOrCreateDirectRoom('u-1', 'u-2');
    expect(res.id).toBe('new-room');
  });

  it('should throw forbidden when chatting with self', async () => {
    await expect(service.getOrCreateDirectRoom('u-1', 'u-1')).rejects.toThrow(ForbiddenException);
  });
  
  it('should send message', async () => {
    mockPrisma.chatRoomMember.findUnique.mockResolvedValue({ id: 'm-1' });
    mockPrisma.chatMessage.create.mockResolvedValue({ id: 'msg-1', content: 'hello' });
    mockPrisma.chatRoomMember.update.mockResolvedValue({ id: 'm-1' });
    const attachment = { url: 'img.png', type: 'image/png', name: 'img' } as MessageAttachmentDto;
    const res = await service.sendMessage('u-1', 'r-1', 'hello', attachment);
    expect(res.content).toBe('hello');
  });
});

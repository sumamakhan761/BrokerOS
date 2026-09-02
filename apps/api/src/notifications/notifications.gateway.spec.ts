import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway.js';
import { SendNotificationDto } from './dto/notifications.dto.js';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection and store socket', () => {
    const mockSocket = {
      id: 'socket-1',
      handshake: {
        auth: {},
        headers: { authorization: 'token' },
        query: { userId: 'u-1' },
      },
      disconnect: jest.fn(),
    } as any;

    gateway.handleConnection(mockSocket);
    expect(mockSocket.disconnect).not.toHaveBeenCalled();

    gateway.sendNotificationToUser('u-1', {
      message: 'hello',
    } as any as SendNotificationDto);
    expect(gateway.server.to).toHaveBeenCalledWith('socket-1');
  });

  it('should disconnect on missing token', () => {
    const mockSocket = {
      handshake: { auth: {}, headers: {}, query: {} },
      disconnect: jest.fn(),
    } as any;

    gateway.handleConnection(mockSocket);
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});

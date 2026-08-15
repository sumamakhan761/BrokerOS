import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
import { ChatGateway } from './chat.gateway.js';
import { ChatService } from './chat.service.js';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  
  const mockChatService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    
    // Mock the socket server
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn()
      })
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle send message', async () => {
    const mockSocket = {
      handshake: { query: { userId: 'u-1' } },
      emit: jest.fn(),
    } as any;
    
    mockChatService.sendMessage.mockResolvedValue({ id: 'msg-1', content: 'test' });
    
    await gateway.handleSendMessage({ roomId: 'r-1', content: 'test' }, mockSocket);
    
    expect(mockChatService.sendMessage).toHaveBeenCalledWith('u-1', 'r-1', 'test', undefined);
    expect(gateway.server.to).toHaveBeenCalledWith('room_r-1');
  });
  
  it('should handle typing', () => {
    const mockSocket = {
      handshake: { query: { userId: 'u-1' } },
      to: jest.fn().mockReturnValue({ emit: jest.fn() })
    } as any;
    
    gateway.handleTyping({ roomId: 'r-1', isTyping: true }, mockSocket);
    expect(mockSocket.to).toHaveBeenCalledWith('room_r-1');
  });
});

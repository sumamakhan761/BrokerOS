import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../lib/database/prisma.service.js';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../lib/database/prisma.service.js', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({})),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('1234567890', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(
        service.validateUser('1234567890', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrismaService.account.findFirst.mockResolvedValue({
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('1234567890', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if password matches', async () => {
      const mockUser = { id: 'user-id', phoneNumber: '1234567890' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.account.findFirst.mockResolvedValue({
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        '1234567890',
        'correct-password',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        phoneNumber: '1234567890',
      };
      // Override validateUser for this test to avoid mocking all its internals again
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const loginDto = { phoneNumber: '1234567890', password: 'password' };
      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'test-token',
        user: mockUser,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        phone: mockUser.phoneNumber,
      });
    });
  });
});

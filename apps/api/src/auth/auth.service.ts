import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../lib/database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(phoneNumber: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // In a real app, password should be stored in the User or Account model.
    // For this schema, we don't have a direct password field on User.
    // Wait, let's check Account model. The Account model has 'password'.
    const account = await this.prisma.account.findFirst({
      where: { userId: user.id },
    });

    if (!account || !account.password) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const isMatch = await bcrypt.compare(pass, account.password);
    if (isMatch) {
      const { password, ...result } = account;
      return user;
    }
    throw new UnauthorizedException('Invalid phone number or password');
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.phoneNumber,
      loginDto.password,
    );

    const payload = { sub: user.id, phone: user.phoneNumber };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    };
  }
}

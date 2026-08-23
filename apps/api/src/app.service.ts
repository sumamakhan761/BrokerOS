import { Injectable } from '@nestjs/common';
import { PrismaService } from './lib/database/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }
}

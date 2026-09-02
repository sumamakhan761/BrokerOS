import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { prismaClient } from '@brokeros/prisma';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useValue: prismaClient,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  // 1. Fail-fast: Connect to the database when the NestJS app starts
  async onModuleInit() {
    await prismaClient.$connect();
  }
  // 2. Prevent Leaks: Close the database connection when the NestJS app shuts down
  async onModuleDestroy() {
    await prismaClient.$disconnect();
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './lib/database/prisma.module.js';

import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth.js';
import { AuthModule } from './auth/auth.module.js';
import { SignInHook } from './auth/sign-in.hook.js';
import { LeadsModule } from './leads/leads.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { BrokersModule } from './brokers/brokers.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ChatModule } from './chat/chat.module.js';
import { MarketingModule } from './marketing/marketing.module.js';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    BetterAuthModule.forRoot({
      auth,
      bodyParser: {
        json: { enabled: true },
        urlencoded: { enabled: true, extended: true },
      },
    }),
    AuthModule,
    LeadsModule,
    DashboardModule,
    ApprovalsModule,
    InventoryModule,
    BrokersModule,
    NotificationsModule,
    ChatModule,
    MarketingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SignInHook,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule { }


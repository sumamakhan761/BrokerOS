import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Roles, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { prismaClient as prisma } from './lib/database/prisma-client.js';
import { auth } from './lib/auth.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @AllowAnonymous()
  @Patch('api/users/:id/location')
  async updateLocation(
    @Param('id') id: string,
    @Body() locationData: { latitude: number; longitude: number }
  ) {
    return await prisma.user.update({
      where: { id },
      data: {
        lastLatitude: locationData.latitude,
        lastLongitude: locationData.longitude,
        lastLocationAt: new Date(),
      }
    });
  }

  @AllowAnonymous()
  @Patch('api/users/:id/push-token')
  async updatePushToken(
    @Param('id') id: string,
    @Body() data: { token: string }
  ) {
    return await prisma.user.update({
      where: { id },
      data: { expoPushToken: data.token }
    });
  }

  @AllowAnonymous()
  @Get('api/users/:id/location')
  async getLocation(@Param('id') id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { lastLatitude: true, lastLongitude: true, lastLocationAt: true, name: true }
    });
    return { success: true, data: user };
  }

  @AllowAnonymous()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @AllowAnonymous()
  @Get('roles')
  async getRoles() {
    return await prisma.role.findMany({
      select: { id: true, name: true, code: true }
    });
  }

  @AllowAnonymous()
  @Get('sources')
  async getSources() {
    return await prisma.leadSource.findMany({
      select: { id: true, name: true }
    });
  }

  @AllowAnonymous()
  @Get('projects')
  async getProjects() {
    return await prisma.project.findMany({
      select: { id: true, name: true, isCpProject: true }
    });
  }

  @Get('users/subordinates')
  async getSubordinates(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];

    return await prisma.user.findMany({
      where: { managerId: userId, status: 'ACTIVE' },
      select: { id: true, name: true, username: true }
    });
  }

  @Get('users/my-projects')
  async getMyProjects(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];

    const assignments = await prisma.projectAssignment.findMany({
      where: { userId, isActive: true },
      include: { project: { select: { id: true, name: true, slug: true, isCpProject: true } } },
    });
    return assignments.map(a => a.project);
  }

  // --- Protected Department Endpoints ---

  @Roles(['PRE_SALES', 'PRE_SALES_MANAGER'])
  @Get('dashboard/pre-sales')
  getPreSales() {
    return { success: true, message: 'Welcome to the secure Pre-Sales Area', data: [] };
  }

  @Roles(['SALES_EXECUTIVE', 'SALES_MANAGER'])
  @Get('dashboard/sales')
  getSales() {
    return { success: true, message: 'Welcome to the secure Sales Area', data: [] };
  }



  @Roles(['FINANCE'])
  @Get('dashboard/finance')
  getFinance() {
    return { success: true, message: 'Welcome to the secure Finance Area', data: [] };
  }

  // NOTE: /api/dashboard/business-manager is now handled by
  //       BusinessManagerDashboardController in the dashboard module.

  @Roles(['DIRECTOR'])
  @Get('dashboard/director')
  getDirector() {
    return { success: true, message: 'Welcome to the secure Director Area', data: [] };
  }

  @Roles(['ADMIN'])
  @Get('dashboard/admin')
  getAdmin() {
    return { success: true, message: 'Welcome to the secure Admin Area', data: [] };
  }

  @Roles(['SOURCING_MANAGER'])
  @Get('dashboard/sourcing-manager')
  getSourcingManager() {
    return { success: true, message: 'Welcome to the secure Sourcing Manager Area', data: [] };
  }

  @Roles(['CHANNEL_PARTNER'])
  @Get('dashboard/channel-partner')
  getChannelPartner() {
    return { success: true, message: 'Welcome to the secure Channel Partner Area', data: [] };
  }
}
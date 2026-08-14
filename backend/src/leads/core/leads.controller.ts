import { Controller, Get, Patch, Post, Param, Body, Query, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service.js';
import { LeadStatus } from '../../generated/prisma/client.js';

@Controller('api/leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
  ) { }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('followUpDate') followUpDate?: string,
    @Query('siteVisitDate') siteVisitDate?: string,
    @Query('scoreRange') scoreRange?: string,
    @Query('managerUnassigned') managerUnassigned?: string,
    @Query('isCpProject') isCpProject?: string,
  ) {
    return this.leadsService.findAll({
      status: status as LeadStatus,
      followUpDate,
      siteVisitDate,
      scoreRange,
      userId: req.user?.id,
      roleId: req.user?.roleId,
      managerUnassigned: managerUnassigned === 'true',
      isCpProject: isCpProject === 'true' ? true : (isCpProject === 'false' ? false : undefined),
    });
  }

  @Post()
  createLead(@Req() req: any, @Body() data: any) {
    return this.leadsService.create(data, req.user?.id);
  }

  @Post('bulk-create')
  bulkCreate(@Req() req: any, @Body() leads: any[]) {
    return this.leadsService.bulkCreate(leads, req.user?.id);
  }

  @Post('assign')
  assignLeads(
    @Req() req: any,
    @Body() data: { leadIds: string[]; targetUserId?: string; roundRobin?: boolean },
  ) {
    return this.leadsService.assignLeads(data.leadIds, req.user?.id, data.targetUserId, data.roundRobin);
  }

  @Get('employee/:employeeId')
  async getEmployeeLeads(@Req() req: any, @Param('employeeId') employeeId: string) {
    return this.leadsService.findAll({
      assignedToId: employeeId,
    });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(id, req.user?.id, req.user?.roleId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LeadStatus, subStatus?: string },
  ) {
    return this.leadsService.updateStatus(id, body.status, body.subStatus);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      preferredLocation?: string;
      budget?: number;
      lastContactDate?: string;
      nextFollowUpDate?: string;
      sourceId?: string;
      interestedProjectId?: string;
      temperature?: string;
      requirements?: string;
      subStatus?: string;
    },
  ) {
    return this.leadsService.update(id, updateData);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@Param('id') id: string, @UploadedFile() file: any) {
    return this.leadsService.uploadAvatar(id, file);
  }

  @Get(':id/avatar-image')
  async getAvatarImage(@Param('id') id: string, @Res() res: any) {
    const lead = await this.leadsService.findOne(id);
    if (!lead || !lead.avatar) {
      return res.status(404).send('No avatar found');
    }

    try {
      const blobRes = await fetch(lead.avatar, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });

      if (!blobRes.ok) {
        return res.status(blobRes.status).send('Failed to fetch blob');
      }

      res.set({
        'Content-Type': blobRes.headers.get('content-type') || 'image/jpeg',
      });

      const arrayBuffer = await blobRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (e) {
      res.status(500).send('Internal server error');
    }
  }
}

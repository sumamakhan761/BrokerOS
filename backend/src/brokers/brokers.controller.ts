import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrokersService } from './brokers.service.js';
import { BrokerActivitiesService } from './broker-activities.service.js';
import { BrokerCommissionsService } from './broker-commissions.service.js';
import { BrokerAiService } from './broker-ai.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('api/brokers')
@UseGuards(AuthGuard)
export class BrokersController {
  constructor(
    private readonly brokersService: BrokersService,
    private readonly activitiesService: BrokerActivitiesService,
    private readonly commissionsService: BrokerCommissionsService,
    private readonly aiService: BrokerAiService
  ) { }

  @Get()
  getBrokers(@Req() req: any, @Query('projectId') projectId?: string, @Query('followUpDate') followUpDate?: string) {
    return this.brokersService.getBrokers(req.user.id, projectId, followUpDate);
  }

  @Get('sourcing-managers')
  getSourcingManagers() {
    return this.brokersService.getSourcingManagers();
  }

  @Get('commissions/all')
  getCommissions(@Req() req: any) {
    return this.commissionsService.getCommissions(req.user.id);
  }

  @Post('commissions/:recordId/complete')
  @UseInterceptors(FileInterceptor('file'))
  completeCommission(
    @Param('recordId') recordId: string,
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    return this.commissionsService.completeCommission(recordId, req.user.id, file);
  }

  @Get(':id')
  getBrokerById(@Param('id') id: string, @Req() req: any) {
    return this.brokersService.getBrokerById(id, req.user.id);
  }

  @Post()
  createBroker(@Body() body: any, @Req() req: any) {
    return this.brokersService.createBroker(body, req.user.id);
  }

  @Patch(':id')
  updateBroker(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.brokersService.updateBroker(id, req.user.id, body);
  }

  @Post(':id/deal')
  updateDealCard(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.brokersService.updateDealCard(id, req.user.id, body);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.activitiesService.addNote(id, req.user.id, body);
  }

  @Post(':id/follow-ups')
  addFollowUp(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.activitiesService.addFollowUp(id, req.user.id, body);
  }

  @Post(':id/meetings')
  addMeeting(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.activitiesService.addMeeting(id, req.user.id, body);
  }

  @Post(':id/ai-transition-note')
  generateAiTransitionNote(@Param('id') id: string, @Req() req: any) {
    return this.aiService.generateAiTransitionNote(id, req.user.id);
  }

  @Patch(':id/meetings/:meetingId/arrive')
  arriveAtMeeting(
    @Param('id') id: string,
    @Param('meetingId') meetingId: string,
    @Req() req: any,
    @Body() locationData: { latitude: number; longitude: number }
  ) {
    return this.activitiesService.arriveAtMeeting(id, meetingId, req.user.id, locationData);
  }

  @Patch(':id/meetings/:meetingId/complete')
  completeMeeting(
    @Param('id') id: string,
    @Param('meetingId') meetingId: string,
    @Req() req: any,
    @Body() data: any
  ) {
    return this.activitiesService.completeMeeting(id, meetingId, req.user.id, data);
  }

  @Patch(':id/follow-ups/:followUpId/confirm')
  confirmFollowUp(
    @Param('id') id: string,
    @Param('followUpId') followUpId: string,
    @Req() req: any
  ) {
    return this.activitiesService.confirmFollowUp(id, followUpId, req.user.id);
  }
}

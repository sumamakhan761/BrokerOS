import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service.js';

@Controller('api/leads')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get(':id/follow-ups')
  getFollowUps(@Param('id') id: string) {
    return this.followUpsService.getFollowUps(id);
  }

  @Post(':id/follow-ups')
  createFollowUp(
    @Param('id') id: string,
    @Body() followUpData: { userId: string; scheduledDate: string; type?: string; remarks?: string },
  ) {
    return this.followUpsService.createFollowUp(id, followUpData);
  }

  @Patch('follow-ups/:followUpId')
  updateFollowUp(
    @Param('followUpId') followUpId: string,
    @Body() updateData: { scheduledDate?: string; type?: string; remarks?: string; status?: string },
  ) {
    return this.followUpsService.updateFollowUp(followUpId, updateData);
  }

  @Delete('follow-ups/:followUpId')
  deleteFollowUp(@Param('followUpId') followUpId: string) {
    return this.followUpsService.deleteFollowUp(followUpId);
  }
}

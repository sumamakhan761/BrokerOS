import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service.js';

@Controller('api/leads')
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get(':id/site-visits')
  getSiteVisits(@Param('id') id: string) {
    return this.siteVisitsService.getSiteVisits(id);
  }

  @Post(':id/site-visits')
  createSiteVisit(
    @Param('id') id: string,
    @Body() siteVisitData: { userId: string; projectId: string; scheduledDate: string; meetingNotes?: string; destinationUrl?: string },
  ) {
    return this.siteVisitsService.createSiteVisit(id, siteVisitData);
  }

  @Patch('site-visits/:siteVisitId')
  updateSiteVisit(
    @Param('siteVisitId') siteVisitId: string,
    @Body() updateData: {
      scheduledDate?: string;
      projectId?: string;
      meetingNotes?: string;
      status?: string;
      interestLevel?: string;
      budgetConfirmed?: number;
      configInterest?: string;
      customerReaction?: string;
      customerObjections?: string;
      closingProbability?: string;
      completedAt?: string;
      nextAction?: string;
    },
  ) {
    return this.siteVisitsService.updateSiteVisit(siteVisitId, updateData);
  }

  @Delete('site-visits/:siteVisitId')
  deleteSiteVisit(@Param('siteVisitId') siteVisitId: string) {
    return this.siteVisitsService.deleteSiteVisit(siteVisitId);
  }

  @Patch(':id/site-visits/:siteVisitId/arrive')
  arriveAtSiteVisit(
    @Param('siteVisitId') siteVisitId: string,
    @Body() locationData: { latitude: number; longitude: number }
  ) {
    return this.siteVisitsService.arriveAtSiteVisit(siteVisitId, locationData);
  }
}

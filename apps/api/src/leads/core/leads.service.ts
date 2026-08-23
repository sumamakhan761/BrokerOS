import { Injectable } from '@nestjs/common';
import { LeadsQueryService } from './leads-query.service.js';
import { LeadsManagementService } from './leads-management.service.js';
import { LeadsMediaService } from './leads-media.service.js';
import { LeadStatus } from '../../generated/prisma/client.js';
import { CreateLeadDto, UpdateLeadDto, GetLeadsFilterDto } from './dto/lead.dto.js';

@Injectable()
export class LeadsService {
  constructor(
    private leadsQuery: LeadsQueryService,
    private leadsManagement: LeadsManagementService,
    private leadsMedia: LeadsMediaService
  ) { }

  async findAll(filters?: GetLeadsFilterDto) {
    return this.leadsQuery.findAll(filters);
  }

  async findOne(id: string, userId?: string, roleId?: string) {
    return this.leadsQuery.findOne(id, userId, roleId);
  }

  async bulkCreate(leads: CreateLeadDto[], managerId: string) {
    return this.leadsManagement.bulkCreate(leads, managerId);
  }

  async assignLeads(leadIds: string[], managerId: string, targetUserId?: string, roundRobin?: boolean) {
    return this.leadsManagement.assignLeads(leadIds, managerId, targetUserId, roundRobin);
  }

  async updateStatus(id: string, status: LeadStatus, subStatus?: string) {
    return this.leadsManagement.updateStatus(id, status, subStatus);
  }

  async create(data: CreateLeadDto, userId?: string) {
    return this.leadsManagement.create(data, userId);
  }

  async update(id: string, data: UpdateLeadDto) {
    return this.leadsManagement.update(id, data);
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    return this.leadsMedia.uploadAvatar(id, file);
  }
}

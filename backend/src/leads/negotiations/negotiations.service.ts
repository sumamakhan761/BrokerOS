import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class NegotiationsService {
  constructor(private prisma: PrismaService) {}

  async getNegotiations(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new BadRequestException('Lead not found');
    
    return this.prisma.negotiation.findMany({
      where: { leadId },
      orderBy: { id: 'desc' }, // Use ID as proxy for created time
      include: {
        salesExec: { select: { username: true, email: true, displayUsername: true } },
      },
    });
  }

  async createNegotiation(
    leadId: string, 
    userId: string, 
    data: { 
      askingPrice?: number;
      offeredPrice?: number;
      customerObjections?: string;
      managerSuggestion?: string;
      negotiationNotes?: string;
      nextActionPlan?: string;
    }
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new BadRequestException('Lead not found');

    return this.prisma.negotiation.create({
      data: {
        leadId,
        salesExecId: userId,
        askingPrice: data.askingPrice,
        offeredPrice: data.offeredPrice,
        customerObjections: data.customerObjections,
        managerSuggestion: data.managerSuggestion,
        negotiationNotes: data.negotiationNotes,
        nextActionPlan: data.nextActionPlan,
      },
      include: {
        salesExec: { select: { username: true, email: true, displayUsername: true } },
      },
    });
  }
}

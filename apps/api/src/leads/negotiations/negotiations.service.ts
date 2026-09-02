import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { CreateNegotiationDto } from './dto/negotiation.dto.js';

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
        salesExec: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });
  }

  async createNegotiation(
    leadId: string,
    userId: string,
    data: CreateNegotiationDto,
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new BadRequestException('Lead not found');

    return this.prisma.negotiation.create({
      data: {
        leadId,
        salesExecId: userId,
        askingPrice: data.askingPrice,
        offeredPrice: data.offeredPrice,
        customerObjections: data.objections,
        managerSuggestion: data.strategy,
        negotiationNotes: data.title,
        nextActionPlan: data.nextStep,
      },
      include: {
        salesExec: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });
  }
}

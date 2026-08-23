import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { SiteVisitStatus, CustomerInterestLevel } from '@brokeros/prisma';

export class CreateSiteVisitDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  meetingNotes?: string;

  @IsString()
  @IsOptional()
  destinationUrl?: string;
}

export class UpdateSiteVisitDto {
  @IsString()
  @IsOptional()
  scheduledDate?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  meetingNotes?: string;

  @IsEnum(SiteVisitStatus)
  @IsOptional()
  status?: SiteVisitStatus;

  @IsEnum(CustomerInterestLevel)
  @IsOptional()
  interestLevel?: CustomerInterestLevel;

  @IsNumber()
  @IsOptional()
  budgetConfirmed?: number;

  @IsString()
  @IsOptional()
  configInterest?: string;

  @IsString()
  @IsOptional()
  customerReaction?: string;

  @IsString()
  @IsOptional()
  customerObjections?: string;

  @IsString()
  @IsOptional()
  closingProbability?: string;

  @IsString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsOptional()
  nextAction?: string;
}

export class ArriveSiteVisitDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { LeadStatus, LeadTemperature } from '../../../generated/prisma/client.js';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  interestedProjectId?: string;

  @IsEnum(LeadTemperature)
  @IsOptional()
  temperature?: LeadTemperature;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsString()
  @IsOptional()
  interestedTowerId?: string;

  @IsString()
  @IsOptional()
  interestedUnitId?: string;

  @IsString()
  @IsOptional()
  brokerId?: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;
}

export class BulkCreateLeadsDto {
  @IsArray()
  leads: CreateLeadDto[];
}

export class AssignLeadsDto {
  @IsArray()
  @IsString({ each: true })
  leadIds: string[];

  @IsString()
  @IsOptional()
  targetUserId?: string;

  @IsBoolean()
  @IsOptional()
  roundRobin?: boolean;
}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  status: LeadStatus;

  @IsString()
  @IsOptional()
  subStatus?: string;
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  lastContactDate?: string;

  @IsString()
  @IsOptional()
  nextFollowUpDate?: string;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  interestedProjectId?: string;

  @IsEnum(LeadTemperature)
  @IsOptional()
  temperature?: LeadTemperature;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  subStatus?: string;
}

export class GetLeadsFilterDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  followUpDate?: string;

  @IsString()
  @IsOptional()
  siteVisitDate?: string;

  @IsString()
  @IsOptional()
  scoreRange?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  managerUnassigned?: boolean;

  @IsString()
  @IsOptional()
  assignedToId?: string;

  @IsBoolean()
  @IsOptional()
  isCpProject?: boolean;
}

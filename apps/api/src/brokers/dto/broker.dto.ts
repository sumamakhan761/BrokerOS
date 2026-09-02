import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum BrokerStatus {
  NEW = 'NEW',
  WARM = 'WARM',
  COLD = 'COLD',
  DEAL = 'DEAL',
}

export enum BrokerSubStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
}

export class CreateBrokerDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  reraNumber?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsOptional()
  @IsString({ each: true })
  serviceAreas?: string | string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedProjects?: string[];

  @IsString()
  @IsOptional()
  sourcingManagerId?: string;
}

export class UpdateBrokerDto {
  @IsEnum(BrokerStatus)
  @IsOptional()
  status?: string;

  @IsEnum(BrokerSubStatus)
  @IsOptional()
  subStatus?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  reraNumber?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsOptional()
  @IsString({ each: true })
  serviceAreas?: string | string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedProjects?: string[];

  @IsString()
  @IsOptional()
  sourcingManagerId?: string;
}

export class UpdateDealCardDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  towerId?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber()
  brokeragePercent?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber()
  brokerageFlat?: number | null;

  @IsArray()
  @IsOptional()
  dealDocuments?: any[];

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}

export class AddBrokerNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AddBrokerFollowUpDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;
}

export class AddBrokerMeetingDto {
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  meetingType?: string;

  @IsString()
  @IsOptional()
  agenda?: string;

  @IsString()
  @IsOptional()
  destinationUrl?: string;
}

export class ArriveAtMeetingDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  longitude: number;
}

export class CompleteMeetingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  meetingType?: string;

  @IsString()
  @IsOptional()
  agenda?: string;

  @IsString()
  @IsOptional()
  satisfactionLevel?: string;

  @IsString()
  @IsOptional()
  commissionDiscussed?: string;

  @IsString()
  @IsOptional()
  nextAction?: string;

  @IsString()
  @IsOptional()
  meetingNotes?: string;
}

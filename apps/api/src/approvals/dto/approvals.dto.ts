import { ApprovalType } from '@brokeros/prisma';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateApprovalRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(ApprovalType)
  @IsOptional()
  type?: ApprovalType;

  @IsString()
  @IsOptional()
  bookingId?: string;
}

export class AddApprovalMessageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  action?: 'APPROVE' | 'REJECT' | 'REPLY';
}

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FollowUpStatus } from '../../../generated/prisma/client.js';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateFollowUpDto {
  @IsString()
  @IsOptional()
  scheduledDate?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsEnum(FollowUpStatus)
  @IsOptional()
  status?: FollowUpStatus;

  @IsString()
  @IsOptional()
  completedAt?: string;
}

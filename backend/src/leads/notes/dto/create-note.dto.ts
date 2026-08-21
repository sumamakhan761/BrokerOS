import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { LeadStatus } from '../../../generated/prisma/client.js';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(LeadStatus)
  @IsOptional()
  statusAtTimeOfNote?: LeadStatus;

  @IsString()
  @IsOptional()
  noteType?: string;
}

export class GenerateAiTransitionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

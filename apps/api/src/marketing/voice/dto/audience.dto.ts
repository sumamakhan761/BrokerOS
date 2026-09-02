import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class VoiceAudienceFiltersDto {
  @IsOptional()
  @IsArray()
  statuses?: string[];

  @IsOptional()
  @IsArray()
  temperatures?: string[];

  @IsOptional()
  @IsArray()
  projectIds?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsInt()
  minBudget?: number;

  @IsOptional()
  @IsInt()
  maxBudget?: number;
}

export class VoiceCsvRecipientDto {
  @IsOptional()
  phone?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  budget?: number;

  @IsOptional()
  interestedProject?: string;

  @IsOptional()
  temperature?: string;

  @IsOptional()
  mergeData?: Record<string, any>;
}

export class PreviewVoiceAudienceDto {
  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  audienceFilters?: any;

  @IsOptional()
  @IsArray()
  csvRecipients?: any[];
}

import { IsOptional, IsString } from 'class-validator';

export class SyncYouTubeCampaignsDto {
  @IsOptional()
  @IsString()
  datePreset?: string;
}

export class YouTubeCampaignQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  format?: string;
}

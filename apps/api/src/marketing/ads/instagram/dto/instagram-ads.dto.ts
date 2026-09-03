import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class ConnectInstagramIntegrationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  adAccountId!: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsOptional()
  instagramActorId?: string;

  @IsString()
  @IsOptional()
  instagramActorHandle?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pageIds?: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class SyncInstagramCampaignsDto {
  @IsString()
  @IsOptional()
  datePreset?: string;
}

export class InstagramQueryFilterDto {
  @IsString()
  @IsOptional()
  integrationId?: string;

  @IsString()
  @IsOptional()
  placement?: string; // "REELS", "STORY", "FEED", "EXPLORE"

  @IsString()
  @IsOptional()
  status?: string;
}

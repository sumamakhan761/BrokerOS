import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class ConnectMetaIntegrationDto {
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
  appId?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pageIds?: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class TestMetaTokenDto {
  @IsString()
  @IsNotEmpty()
  adAccountId!: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}

export class SyncMetaCampaignsDto {
  @IsString()
  @IsOptional()
  datePreset?: string; // e.g. "maximum", "last_30d", "this_month"
}

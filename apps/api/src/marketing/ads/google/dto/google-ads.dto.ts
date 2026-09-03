import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class GoogleOAuthUrlQueryDto {
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;

  @IsString()
  @IsOptional()
  state?: string;
}

export class GoogleOAuthCallbackDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  redirectUri!: string;
}

export class ConnectGoogleIntegrationDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string; // "123-456-7890" or "1234567890"

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  managerCustomerId?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class TestGoogleTokenDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @IsString()
  @IsOptional()
  managerCustomerId?: string;
}

export class SyncGoogleCampaignsDto {
  @IsString()
  @IsOptional()
  datePreset?: string;
}

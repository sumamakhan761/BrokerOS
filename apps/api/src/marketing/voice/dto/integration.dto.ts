import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class ConnectVoiceTelephonyDto {
  @IsString()
  @IsNotEmpty()
  provider!: 'TWILIO' | 'VOBIZ' | 'EXOTEL' | 'TELNYX' | 'AMAZON_CONNECT';

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  accountSid?: string;

  @IsOptional()
  @IsString()
  authToken?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  sipDomain?: string;

  @IsOptional()
  @IsArray()
  fromNumbers?: string[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ConnectVoiceAgentDto {
  @IsString()
  @IsNotEmpty()
  platform!:
    | 'VAPI'
    | 'RETELL'
    | 'ELEVENLABS'
    | 'SARVAM'
    | 'BOLNA'
    | 'PIPECAT'
    | 'LIVEKIT'
    | 'OPENAI_REALTIME';

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  serverUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PreviewAudioTtsDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsOptional()
  @IsString()
  voiceProvider?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;
}

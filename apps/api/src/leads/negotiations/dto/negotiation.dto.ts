import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNegotiationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  askingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offeredPrice?: number;

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  strategy?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  nextStep?: string;
}

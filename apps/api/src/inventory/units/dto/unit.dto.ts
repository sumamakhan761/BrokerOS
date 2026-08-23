import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { UnitTypeEnum } from '../../towers/dto/tower.dto.js';

export class UpdateUnitStatusDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  commissionAmount?: number;

  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @IsOptional()
  @IsEnum(UnitTypeEnum)
  type?: UnitTypeEnum;

  @IsOptional()
  @IsString()
  facing?: string;

  @IsOptional()
  @IsBoolean()
  clearBooking?: boolean;
}

export class UpdatePossessionDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  timeline?: any; // Often can be string or Date object
}

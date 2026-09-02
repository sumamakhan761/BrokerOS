import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum FrequencyEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export class CreateScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  netAmount: number;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsNumber()
  @IsOptional()
  installmentsCount?: number;

  @IsEnum(FrequencyEnum)
  @IsOptional()
  frequency?: 'MONTHLY' | 'QUARTERLY';

  @IsNumber()
  @IsOptional()
  percentagePerMonth?: number;
}

export class MarkAsPaidDto {
  @IsString()
  @IsNotEmpty()
  amountPaid: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

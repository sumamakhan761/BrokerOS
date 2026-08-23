import { IsOptional, IsString } from 'class-validator';

export class ReceiveCommissionDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}

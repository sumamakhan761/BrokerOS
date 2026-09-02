import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UnitTypeEnum {
  STUDIO = 'STUDIO',
  ONE_BHK = 'ONE_BHK',
  TWO_BHK = 'TWO_BHK',
  THREE_BHK = 'THREE_BHK',
  FOUR_BHK = 'FOUR_BHK',
  PENTHOUSE = 'PENTHOUSE',
  VILLA = 'VILLA',
  SHOP = 'SHOP',
  OFFICE = 'OFFICE',
}

export class GenerateTowerPromptDto {
  @IsString()
  prompt: string;
}

export class TowerUnitDto {
  @IsString()
  unitNumber: string;

  @IsOptional()
  @IsEnum(UnitTypeEnum)
  type?: any; // The service handles validation with fallback

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @IsOptional()
  @IsString()
  facing?: string;
}

export class TowerFloorDto {
  @IsOptional()
  @IsString()
  floorNumber?: any;

  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TowerUnitDto)
  units: TowerUnitDto[];
}

export class SaveTowerDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TowerFloorDto)
  floors: TowerFloorDto[];
}

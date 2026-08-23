import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProjectQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCpProject?: any; // The service logic explicitly handles 'true' or true
}

export class CreateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  builderId?: string;

  @IsOptional()
  @IsString()
  builderName?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCpProject?: any; // Service logic: data.isCpProject === 'true' || data.isCpProject === true

  // Other project fields can be strictly added as needed when expanding the API
}

export class AssignProjectDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sourcingManagerIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  closingManagerIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  salesExecIds?: string[];
}

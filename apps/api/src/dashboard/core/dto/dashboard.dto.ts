import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsNumber()
  coldCallTarget: number;

  @IsBoolean()
  assignToAll: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsNumber()
  coldCallTarget?: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  backlogOverride?: number;
}

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}

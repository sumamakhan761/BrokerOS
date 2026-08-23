import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  type: any;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  skipWebSocket?: boolean;
}

export class SendNotificationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  userId: string;

  @IsString()
  type: any;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string | null;

  @IsOptional()
  @IsString()
  entityType?: string | null;

  @IsOptional()
  @IsString()
  entityId?: string | null;

  @IsOptional()
  @IsString()
  actionUrl?: string | null;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  readAt?: Date | null;
}

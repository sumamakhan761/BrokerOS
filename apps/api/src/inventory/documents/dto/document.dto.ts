import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  towerId?: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' || value === true || value === 1 || value === '1',
  )
  @IsBoolean()
  isPublic?: boolean;
}

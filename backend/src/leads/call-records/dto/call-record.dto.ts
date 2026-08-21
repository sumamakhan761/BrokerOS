import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UploadCallRecordDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  startedAt: string;

  @IsString()
  @IsNotEmpty()
  endedAt: string;
}

export class CallStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isOnCall: boolean;
}

export class AvailableProjectDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

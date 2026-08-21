import { IsString, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageAttachmentDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SendMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageAttachmentDto)
  attachment?: MessageAttachmentDto;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class TypingIndicatorDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}

export class SendSocketMessageDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageAttachmentDto)
  attachment?: MessageAttachmentDto;
}

import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsString()
  @IsOptional()
  unitDescription?: string;

  @IsNumber()
  @IsOptional()
  agreedPrice?: number;

  @IsNumber()
  @IsOptional()
  bookingAmount?: number;

  @IsNumber()
  @IsOptional()
  commissionPercentage?: number;

  @IsNumber()
  @IsOptional()
  commissionAmount?: number;

  @IsString()
  @IsOptional()
  paymentMode?: string;

  @IsString()
  @IsOptional()
  transactionRef?: string;

  @IsBoolean()
  @IsOptional()
  loanRequired?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateBookingDto extends CreateBookingDto {
  @IsString()
  @IsOptional()
  bookingId?: string;
}

export class BookingIdDto {
  @IsString()
  bookingId: string;
}

export class CancelBookingDto {
  @IsString()
  bookingId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UploadBookingDocumentDto {
  @IsString()
  bookingId: string;

  @IsString()
  docType: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class SaveLoanCaseDto {
  @IsString()
  bookingId: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class SaveAgreementDto {
  @IsString()
  bookingId: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class SaveHandoverDto {
  @IsString()
  bookingId: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class UploadPostSalesFileDto {
  @IsString()
  bookingId: string;

  @IsString()
  type: 'loan' | 'agreement' | 'handover';

  @IsString()
  fieldName: string;
}

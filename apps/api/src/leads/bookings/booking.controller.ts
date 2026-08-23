import { Controller, Get, Post, Patch, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookingService } from './booking.service.js';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingIdDto,
  CancelBookingDto,
  UploadBookingDocumentDto,
  SaveLoanCaseDto,
  SaveAgreementDto,
  SaveHandoverDto,
  UploadPostSalesFileDto
} from './dto/booking.dto.js';

@Controller('api/leads')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':id/booking')
  getBooking(@Param('id') id: string) {
    return this.bookingService.getBooking(id);
  }

  @Post(':id/booking')
  createBooking(
    @Param('id') id: string,
    @Body() bookingData: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(id, bookingData);
  }

  @Patch(':id/booking')
  updateBooking(
    @Param('id') id: string,
    @Body() body: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(body.bookingId!, body);
  }

  @Post(':id/booking/done')
  markBookingDone(@Param('id') leadId: string, @Body() body: BookingIdDto) {
    return this.bookingService.markBookingDone(body.bookingId);
  }

  @Post(':id/booking/cancel')
  cancelBooking(@Param('id') leadId: string, @Body() body: CancelBookingDto) {
    return this.bookingService.cancelBooking(body.bookingId, body.reason);
  }

  @Post(':id/booking/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadBookingDocument(
    @Body() body: UploadBookingDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookingService.uploadDocument(body.bookingId, body.docType, file, body.description);
  }

  @Post(':id/booking/loan-case')
  saveLoanCase(@Body() body: SaveLoanCaseDto) {
    return this.bookingService.saveLoanCase(body.bookingId, body.data || {});
  }

  @Post(':id/booking/agreement')
  saveAgreement(@Body() body: SaveAgreementDto) {
    return this.bookingService.saveAgreement(body.bookingId, body.data || {});
  }

  @Post(':id/booking/handover')
  saveHandover(@Body() body: SaveHandoverDto) {
    return this.bookingService.saveHandover(body.bookingId, body.data || {});
  }

  @Post(':id/booking/post-sales-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadPostSalesFile(
    @Body() body: UploadPostSalesFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookingService.uploadPostSalesFile(body.bookingId, body.type, body.fieldName, file);
  }
}


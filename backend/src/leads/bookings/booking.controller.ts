import { Controller, Get, Post, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookingService } from './booking.service.js';

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
    @Body() bookingData: any,
  ) {
    return this.bookingService.createBooking(id, bookingData);
  }

  @Post(':id/booking/done')
  markBookingDone(@Param('id') leadId: string, @Body() body: { bookingId: string }) {
    return this.bookingService.markBookingDone(body.bookingId);
  }

  @Post(':id/booking/cancel')
  cancelBooking(@Param('id') leadId: string, @Body() body: { bookingId: string, reason?: string }) {
    return this.bookingService.cancelBooking(body.bookingId, body.reason);
  }

  @Post(':id/booking/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadBookingDocument(
    @Body() body: { docType: string; bookingId: string; description?: string },
    @UploadedFile() file: any,
  ) {
    return this.bookingService.uploadDocument(body.bookingId, body.docType, file, body.description);
  }

  @Post(':id/booking/loan-case')
  saveLoanCase(@Body() body: any) {
    return this.bookingService.saveLoanCase(body.bookingId, body.data);
  }

  @Post(':id/booking/agreement')
  saveAgreement(@Body() body: any) {
    return this.bookingService.saveAgreement(body.bookingId, body.data);
  }

  @Post(':id/booking/handover')
  saveHandover(@Body() body: any) {
    return this.bookingService.saveHandover(body.bookingId, body.data);
  }

  @Post(':id/booking/post-sales-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadPostSalesFile(
    @Body() body: { bookingId: string; type: 'loan' | 'agreement' | 'handover'; fieldName: string },
    @UploadedFile() file: any,
  ) {
    return this.bookingService.uploadPostSalesFile(body.bookingId, body.type, body.fieldName, file);
  }
}

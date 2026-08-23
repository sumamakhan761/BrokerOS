import { Controller, Post, Get, Param, Body, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateScheduleDto, MarkAsPaidDto } from './dto/payment.dto.js';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('schedule/:bookingId')
  async createSchedule(
    @Param('bookingId') bookingId: string,
    @Body() body: CreateScheduleDto
  ) {
    if (!body.installmentsCount && !body.percentagePerMonth) {
      throw new BadRequestException('Either installmentsCount or percentagePerMonth is required');
    }
    return this.paymentsService.createSchedule(bookingId, body);
  }

  @Get('closing-manager')
  async getPendingPayments(@Query('managerId') managerId: string) {
    return this.paymentsService.getPendingPayments(managerId);
  }

  @Get('booking/:bookingId')
  async getSchedulesByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getSchedulesByBooking(bookingId);
  }

  @Post(':scheduleId/pay')
  @UseInterceptors(FileInterceptor('receipt'))
  async markAsPaid(
    @Param('scheduleId') scheduleId: string,
    @Body() body: MarkAsPaidDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!body.amountPaid) {
      throw new BadRequestException('Amount paid is required');
    }
    const amount = parseFloat(body.amountPaid);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount paid');
    }

    return this.paymentsService.markAsPaid(scheduleId, amount, body.remarks, file);
  }
}

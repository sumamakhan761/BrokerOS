import { Controller, Get, Req } from '@nestjs/common';
import { BookingService } from './booking.service.js';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getAllBookings(@Req() req: { user?: { id: string, roleId: string } }) {
    const userId = req.user?.id || '';
    const roleId = req.user?.roleId || '';
    return this.bookingService.getAllBookings(userId, roleId);
  }
}

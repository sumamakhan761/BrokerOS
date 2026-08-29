import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '@thallesp/nestjs-better-auth';
import { SmsService } from '../sms.service.js';

@Controller()
export class SmsTrackingController {
  constructor(private readonly smsService: SmsService) {}

  @Public()
  @Get('s/:code')
  async resolveShortLink(@Param('code') code: string, @Req() req: Request, @Res() res: Response) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const destinationUrl = await this.smsService.resolveShortLink(code, ip, userAgent);
    res.redirect(302, destinationUrl);
  }

  @Public()
  @Get('api/marketing/sms/track/click')
  async trackSmsClick(
    @Query('code') code: string,
    @Query('url') targetUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const destination = targetUrl || 'https://brokeros.io';
    if (code) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await this.smsService.resolveShortLink(code, ip, userAgent);
    }
    res.redirect(302, destination);
  }
}

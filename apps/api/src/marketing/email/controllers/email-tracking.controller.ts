import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from '@thallesp/nestjs-better-auth';
import { EmailService } from '../email.service.js';

// 1x1 Transparent GIF base64
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

@Controller('api/marketing')
export class EmailTrackingController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Get('track/open')
  async trackOpen(
    @Query('cid') campaignId: string,
    @Query('rid') recipientId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (campaignId && recipientId) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await this.emailService.recordOpenEvent(campaignId, recipientId, ip, userAgent);
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(TRANSPARENT_GIF_BUFFER);
  }

  @Public()
  @Get('track/click')
  async trackClick(
    @Query('cid') campaignId: string,
    @Query('rid') recipientId: string,
    @Query('url') targetUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const destination = targetUrl || 'https://brokeros.io';

    if (campaignId && recipientId && targetUrl) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await this.emailService.recordClickEvent(campaignId, recipientId, targetUrl, ip, userAgent);
    }

    res.redirect(302, destination);
  }

  @Public()
  @Get('unsubscribe')
  async unsubscribe(
    @Query('email') email: string,
    @Query('cid') campaignId: string,
    @Res() res: Response,
  ) {
    if (email) {
      await this.emailService.recordUnsubscribe(email, campaignId);
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Unsubscribed — BrokerOS</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #09090b; color: #f4f4f5; }
            .card { max-width: 440px; text-align: center; padding: 40px 24px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            .icon { width: 56px; height: 56px; margin: 0 auto 16px; background: #27272a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #ffffff; }
            p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin: 0 0 24px; }
            .email-badge { display: inline-block; background: #27272a; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #e4e4e7; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✉️</div>
            <h1>You have been unsubscribed</h1>
            <p>You will no longer receive marketing communications from this campaign.</p>
            <div class="email-badge">${email || 'Your email'}</div>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}

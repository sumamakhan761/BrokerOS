import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { EmailService } from '../email.service.js';
import { SesWebhookParser } from '@brokeros/int-mail-ses';
import { SendgridWebhookParser } from '@brokeros/int-mail-sendgrid';
import { BrevoWebhookParser } from '@brokeros/int-mail-brevo';
import { MailchimpWebhookParser } from '@brokeros/int-mail-mailchimp';

@Controller('api/marketing/webhooks')
export class EmailWebhooksController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('ses')
  @HttpCode(200)
  async handleSesWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = SesWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('sendgrid')
  @HttpCode(200)
  async handleSendgridWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = SendgridWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('brevo')
  @HttpCode(200)
  async handleBrevoWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = BrevoWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('mailchimp')
  @HttpCode(200)
  async handleMailchimpWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = MailchimpWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }
}

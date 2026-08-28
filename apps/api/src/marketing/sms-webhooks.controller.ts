import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { SmsService } from './sms.service.js';
import { TwilioSmsWebhookParser } from '@brokeros/int-sms-twilio';
import { AwsSnsWebhookParser } from '@brokeros/int-sms-aws-sns';
import { SinchSmsWebhookParser } from '@brokeros/int-sms-sinch';
import { GupshupWebhookParser } from '@brokeros/int-sms-gupshup';

@Public()
@Controller('api/marketing/sms/webhooks')
export class SmsWebhooksController {
  constructor(private readonly smsService: SmsService) {}

  @Post('twilio')
  @HttpCode(200)
  async handleTwilioWebhook(@Headers() headers: Record<string, any>, @Body() payload: any) {
    const events = TwilioSmsWebhookParser.parse(headers, payload);
    if (events.length > 0) {
      await this.smsService.processWebhookEvents(events);
    }
    return { received: true, count: events.length };
  }

  @Post('aws-sns')
  @HttpCode(200)
  async handleAwsSnsWebhook(@Headers() headers: Record<string, any>, @Body() payload: any) {
    const events = AwsSnsWebhookParser.parse(headers, payload);
    if (events.length > 0) {
      await this.smsService.processWebhookEvents(events);
    }
    return { received: true, count: events.length };
  }

  @Post('sinch')
  @HttpCode(200)
  async handleSinchWebhook(@Headers() headers: Record<string, any>, @Body() payload: any) {
    const events = SinchSmsWebhookParser.parse(headers, payload);
    if (events.length > 0) {
      await this.smsService.processWebhookEvents(events);
    }
    return { received: true, count: events.length };
  }

  @Post('gupshup')
  @HttpCode(200)
  async handleGupshupWebhook(@Headers() headers: Record<string, any>, @Body() payload: any) {
    const events = GupshupWebhookParser.parse(headers, payload);
    if (events.length > 0) {
      await this.smsService.processWebhookEvents(events);
    }
    return { received: true, count: events.length };
  }
}

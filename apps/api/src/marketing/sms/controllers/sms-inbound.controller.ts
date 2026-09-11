// ============================================================================
// BrokerOS — Inbound SMS Webhook Controller (All 4 Providers + Universal)
// ============================================================================

import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { SmsInboundService } from '../services/sms-inbound.service.js';
import {
  UniversalInboundSmsDto,
  SimulateInboundSmsReplyDto,
} from '../dto/sms-flows.dto.js';
import { TwilioSmsWebhookParser } from '@brokeros/int-sms-twilio';
import { AwsSnsWebhookParser } from '@brokeros/int-sms-aws-sns';
import { SinchSmsWebhookParser } from '@brokeros/int-sms-sinch';
import { GupshupWebhookParser } from '@brokeros/int-sms-gupshup';

@Controller(['api/marketing/sms/inbound', 'api/marketing/sms/inbound-webhooks'])
export class SmsInboundController {
  constructor(private readonly inboundService: SmsInboundService) {}

  /**
   * Universal Inbound Webhook (Accepts standard JSON from custom forwarders, etc.)
   */
  @Public()
  @Post(['', 'inbound'])
  @HttpCode(200)
  async handleUniversalInbound(
    @Body() dto: UniversalInboundSmsDto,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.handleInboundSms({
      ...dto,
      headers: dto.headers || headers,
    });
  }

  /**
   * Twilio Inbound SMS Webhook
   */
  @Public()
  @Post(['twilio', 'twilio/inbound'])
  @HttpCode(200)
  async handleTwilioInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = TwilioSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'TWILIO',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * AWS SNS / Pinpoint Inbound SMS Webhook
   */
  @Public()
  @Post(['aws-sns', 'aws-sns/inbound', 'sns', 'sns/inbound'])
  @HttpCode(200)
  async handleAwsSnsInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = AwsSnsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'AWS_SNS',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Sinch Inbound SMS Webhook
   */
  @Public()
  @Post(['sinch', 'sinch/inbound'])
  @HttpCode(200)
  async handleSinchInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = SinchSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'SINCH',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Gupshup Inbound SMS Webhook
   */
  @Public()
  @Post(['gupshup', 'gupshup/inbound'])
  @HttpCode(200)
  async handleGupshupInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = GupshupWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'GUPSHUP',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Test Inbound Simulation Endpoint
   */
  @Public()
  @Post('simulate')
  @HttpCode(200)
  async simulateReply(@Body() dto: SimulateInboundSmsReplyDto) {
    return this.inboundService.simulateInboundReply(dto);
  }
}

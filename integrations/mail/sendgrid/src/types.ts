export interface SendgridWebhookEventPayload {
  email: string;
  timestamp: number;
  event: 'processed' | 'dropped' | 'delivered' | 'deferred' | 'bounce' | 'open' | 'click' | 'spamreport' | 'unsubscribe' | 'group_unsubscribe';
  sg_message_id?: string;
  campaign_id?: string;
  response?: string;
  reason?: string;
  status?: string;
  url?: string;
  ip?: string;
  useragent?: string;
}

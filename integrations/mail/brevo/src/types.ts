export interface BrevoWebhookEventPayload {
  event: 'request' | 'delivered' | 'hard_bounce' | 'soft_bounce' | 'blocked' | 'spam' | 'invalid_email' | 'deferred' | 'click' | 'opened' | 'unique_opened' | 'unsubscribed' | 'list_addition';
  email: string;
  id?: number;
  date: string;
  'message-id'?: string;
  ts?: number;
  'event-id'?: string;
  link?: string;
  ip?: string;
  user_agent?: string;
  reason?: string;
  tag?: string;
  campaign_name?: string;
}

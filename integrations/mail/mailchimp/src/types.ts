export interface MailchimpWebhookPayload {
  type: 'subscribe' | 'unsubscribe' | 'profile' | 'upemail' | 'cleaned' | 'campaign';
  fired_at: string;
  data: {
    id?: string;
    list_id?: string;
    email?: string;
    email_type?: string;
    status?: string;
    reason?: string;
    merges?: Record<string, any>;
    ip_opt?: string;
    ip_signup?: string;
    subject?: string;
  };
}

export interface SesCredentials {
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface SesSnsNotification {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
}

export interface SesEventPayload {
  eventType: 'Send' | 'Delivery' | 'Open' | 'Click' | 'Bounce' | 'Complaint' | 'Reject';
  mail: {
    messageId: string;
    source: string;
    destination: string[];
    tags?: Record<string, string[]>;
  };
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: Array<{ emailAddress: string; status: string; diagnosticCode?: string }>;
  };
  complaint?: {
    complainedRecipients: Array<{ emailAddress: string }>;
    complaintFeedbackType?: string;
  };
  open?: {
    ipAddress?: string;
    userAgent?: string;
    timestamp?: string;
  };
  click?: {
    ipAddress?: string;
    userAgent?: string;
    link?: string;
    timestamp?: string;
  };
}

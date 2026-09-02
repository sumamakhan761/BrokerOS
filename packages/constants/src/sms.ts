// ============================================================================
// BrokerOS — SMS Marketing Provider Catalog & Templates
// ============================================================================

export const SMS_PROVIDERS = {
  TWILIO: {
    id: 'TWILIO',
    type: 'TWILIO',
    name: 'Twilio Programmable SMS',
    badge: 'Global / High Speed',
    color: '#F22F46',
    docsUrl: 'https://www.twilio.com/docs/sms',
    description: 'Enterprise worldwide SMS delivery with smart Alphanumeric Sender IDs and automatic carrier routing.',
    fields: [
      { key: 'accountSid', label: 'Twilio Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Twilio Auth Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender ID / Twilio Phone Number', type: 'text', placeholder: ' SKYLINE', required: true },
      { key: 'messagingServiceSid', label: 'Messaging Service SID (Optional)', type: 'text', placeholder: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: false },
    ],
    requiresCredentials: true,
  },
  AWS_SNS: {
    id: 'AWS_SNS',
    type: 'AWS_SNS',
    name: 'Amazon Simple Notification Service (SNS)',
    badge: 'Cost Effective',
    color: '#FF9900',
    docsUrl: 'https://docs.aws.amazon.com/sns/',
    description: 'Mass scale global SMS infrastructure with transactional priority & low per-message rates ($0.00645).',
    fields: [
      { key: 'awsAccessKeyId', label: 'AWS Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'awsSecretKey', label: 'AWS Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', required: true },
      { key: 'awsRegion', label: 'AWS Region', type: 'text', placeholder: 'ap-south-1', required: true },
      { key: 'senderId', label: 'Sender ID Header', type: 'text', placeholder: 'SKYLIN', required: false },
    ],
    requiresCredentials: true,
  },
  SINCH: {
    id: 'SINCH',
    type: 'SINCH',
    name: 'Sinch Enterprise SMS',
    badge: 'Tier-1 Direct Routing',
    color: '#0052FF',
    docsUrl: 'https://developers.sinch.com/docs/sms/',
    description: 'Direct operator connectivity across Europe, North America, and Asia-Pacific with high delivery SLAs.',
    fields: [
      { key: 'servicePlanId', label: 'Sinch Service Plan ID', type: 'text', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'apiKey', label: 'Sinch API Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender Number / Alphanumeric ID', type: 'text', placeholder: 'SKYLNR', required: true },
    ],
    requiresCredentials: true,
  },
  GUPSHUP: {
    id: 'GUPSHUP',
    type: 'GUPSHUP',
    name: 'Gupshup Enterprise (DLT India)',
    badge: 'India DLT Compliant',
    color: '#10B981',
    docsUrl: 'https://www.gupshup.io/developer/docs',
    description: 'Specialized for India Telecom regulations with TRAI DLT template registration & scrub engine.',
    fields: [
      { key: 'apiKey', label: 'Gupshup API Key', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'senderId', label: 'DLT Header / Sender ID (6 Chars)', type: 'text', placeholder: 'SKYLRE', required: true },
      { key: 'dltEntityId', label: 'DLT Principal Entity ID (PE ID)', type: 'text', placeholder: '11015544800000xxxxx', required: true },
    ],
    requiresCredentials: true,
  },
} as const;

export const SMS_PROVIDER_LIST = Object.values(SMS_PROVIDERS);

export const SMS_CHAR_LIMITS = {
  GSM_SINGLE_SEGMENT: 160,
  GSM_MULTI_SEGMENT: 153,
  UNICODE_SINGLE_SEGMENT: 70,
  UNICODE_MULTI_SEGMENT: 67,
} as const;

export const DEFAULT_SMS_MERGE_TAGS = [
  { tag: '{{lead.name}}', label: 'Lead Name' },
  { tag: '{{lead.firstName}}', label: 'First Name' },
  { tag: '{{lead.phone}}', label: 'Phone' },
  { tag: '{{lead.city}}', label: 'City' },
  { tag: '{{project.name}}', label: 'Project Name' },
  { tag: '{{project.location}}', label: 'Location' },
  { tag: '{{project.startingPrice}}', label: 'Starting Price' },
  { tag: '{{agent.name}}', label: 'Agent Name' },
  { tag: '{{agent.phone}}', label: 'Agent Phone' },
  { tag: '{{shortUrl}}', label: 'Short Tracking Link' },
] as const;

export const DEFAULT_SMS_TEMPLATES = [
  {
    id: 'tpl_luxury_invitation',
    name: 'Luxury Residence Private Preview',
    category: 'NEW_LAUNCH',
    dltTemplateId: '1107161829000021345',
    content:
      'Dear {{lead.name}}, exclusive preview for {{project.name}}, {{project.location}} starts this weekend. 3 & 4 BHK ultra-luxury residences with golf course views. Book private site visit: {{shortUrl}} - Skyline Realty',
    message:
      'Dear {{lead.name}}, exclusive preview for {{project.name}}, {{project.location}} starts this weekend. 3 & 4 BHK ultra-luxury residences with golf course views. Book private site visit: {{shortUrl}} - Skyline Realty',
  },
  {
    id: 'tpl_price_benefit',
    name: 'Pre-Launch Price Advantage',
    category: 'DISCOUNT_OFFER',
    dltTemplateId: '1107161829000021346',
    content:
      'Hello {{lead.name}}, save up to ₹15 Lakhs on early bookings at {{project.name}}. Starting at {{project.startingPrice}}. Special 10:90 payment plan valid till Sunday: {{shortUrl}} - Skyline',
    message:
      'Hello {{lead.name}}, save up to ₹15 Lakhs on early bookings at {{project.name}}. Starting at {{project.startingPrice}}. Special 10:90 payment plan valid till Sunday: {{shortUrl}} - Skyline',
  },
  {
    id: 'tpl_site_visit_reminder',
    name: 'Confirmed Site Visit Pass',
    category: 'SITE_VISIT',
    dltTemplateId: '1107161829000021347',
    content:
      'Hi {{lead.name}}, your VIP access pass for {{project.name}} is confirmed for tomorrow. Location & valet details: {{shortUrl}}. Relationship Mgr: {{agent.name}} ({{agent.phone}}) - Skyline',
    message:
      'Hi {{lead.name}}, your VIP access pass for {{project.name}} is confirmed for tomorrow. Location & valet details: {{shortUrl}}. Relationship Mgr: {{agent.name}} ({{agent.phone}}) - Skyline',
  },
  {
    id: 'tpl_possession_ready',
    name: 'Ready to Move-in Notice',
    category: 'READY_INVENTORY',
    dltTemplateId: '1107161829000021348',
    content:
      'Dear {{lead.name}}, OC received for {{project.name}}! Zero GST benefit on remaining ready-to-move-in luxury units. Schedule key handover tour: {{shortUrl}} - Skyline Realty',
    message:
      'Dear {{lead.name}}, OC received for {{project.name}}! Zero GST benefit on remaining ready-to-move-in luxury units. Schedule key handover tour: {{shortUrl}} - Skyline Realty',
  },
] as const;

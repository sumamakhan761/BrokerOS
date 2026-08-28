// ============================================================================
// BrokerOS — Shared Constants
// ============================================================================

export const EMAIL_PROVIDERS = {
  SYSTEM_DEFAULT: {
    id: 'SYSTEM_DEFAULT',
    name: 'BrokerOS Default (AWS SES)',
    description: 'Built-in high deliverability email engine. Zero setup required.',
    isDefault: true,
    badge: 'System Master Engine',
    color: '#0284c7', // Sky Blue
    docsUrl: 'https://docs.aws.amazon.com/ses/',
  },
  AWS_SES: {
    id: 'AWS_SES',
    name: 'Amazon SES',
    description: 'High-volume enterprise sending with your own AWS account.',
    isDefault: false,
    badge: 'Cost-Effective ($0.10 / 1k)',
    color: '#f97316', // Orange
    docsUrl: 'https://docs.aws.amazon.com/ses/',
  },
  SENDGRID: {
    id: 'SENDGRID',
    name: 'SendGrid (Twilio)',
    description: 'Industry-standard marketing and transactional email delivery.',
    isDefault: false,
    badge: 'API Key Connect',
    color: '#1a82e2', // SendGrid Blue
    docsUrl: 'https://docs.sendgrid.com/',
  },
  BREVO: {
    id: 'BREVO',
    name: 'Brevo (formerly Sendinblue)',
    description: 'All-in-one marketing platform with free daily tier.',
    isDefault: false,
    badge: 'Generous Free Tier',
    color: '#0092ff', // Brevo Blue
    docsUrl: 'https://developers.brevo.com/',
  },
  MAILCHIMP: {
    id: 'MAILCHIMP',
    name: 'Mailchimp',
    description: 'World-famous marketing platform with rich audience sync.',
    isDefault: false,
    badge: 'OAuth & API Key',
    color: '#ffe01b', // Mailchimp Yellow
    docsUrl: 'https://mailchimp.com/developer/',
  },
} as const;

export const CAMPAIGN_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray', bg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  SCHEDULED: { label: 'Scheduled', color: 'amber', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  PROCESSING: { label: 'Sending...', color: 'blue', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  PAUSED: { label: 'Paused', color: 'yellow', bg: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' },
  FAILED: { label: 'Failed', color: 'rose', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
  CANCELLED: { label: 'Cancelled', color: 'zinc', bg: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
} as const;

export const DEFAULT_MERGE_TAGS = [
  { tag: '{{lead.firstName}}', label: 'Lead First Name', sample: 'Rahul' },
  { tag: '{{lead.lastName}}', label: 'Lead Last Name', sample: 'Sharma' },
  { tag: '{{lead.fullName}}', label: 'Lead Full Name', sample: 'Rahul Sharma' },
  { tag: '{{lead.city}}', label: 'Lead City', sample: 'Mumbai' },
  { tag: '{{project.name}}', label: 'Project Name', sample: 'Skyline Luxuria' },
  { tag: '{{project.startingPrice}}', label: 'Starting Price', sample: '₹1.45 Cr' },
  { tag: '{{project.location}}', label: 'Project Location', sample: 'Bandra West, Mumbai' },
  { tag: '{{project.brochureUrl}}', label: 'Brochure Link', sample: 'https://brokeros.io/brochure/skyline' },
  { tag: '{{agent.name}}', label: 'Assigned Agent Name', sample: 'Amit Verma' },
  { tag: '{{agent.phone}}', label: 'Assigned Agent Phone', sample: '+91 98765 43210' },
  { tag: '{{unsubscribeUrl}}', label: 'Unsubscribe Link', sample: 'https://brokeros.io/api/marketing/unsubscribe?id=...' },
] as const;

export const SAMPLE_CSV_HEADERS = [
  'Full Name',
  'Email',
  'Phone Number',
  'City',
  'Budget (INR)',
  'Interested Project',
  'Lead Temperature (HOT/WARM/COLD)',
  'Tags',
] as const;

export const SAMPLE_CSV_CONTENT = `Full Name,Email,Phone Number,City,Budget (INR),Interested Project,Lead Temperature (HOT/WARM/COLD),Tags
Rahul Sharma,rahul.sharma@example.com,+919876543210,Mumbai,15000000,Skyline Luxuria,HOT,Investor;Luxury
Priya Patel,priya.patel@example.com,+919812345678,Pune,8500000,Green Valley,WARM,First-Time Buyer
Amit Verma,amit.verma@example.com,+919823456789,Bangalore,22000000,Signature Towers,COLD,NRI;Penthouse
Sneha Reddy,sneha.reddy@example.com,+919834567890,Hyderabad,12000000,Skyline Luxuria,HOT,High-Net-Worth
Vikram Malhotra,vikram.m@example.com,+919845678901,Delhi NCR,18000000,Signature Towers,WARM,Ready-To-Move
`;

// ============================================================================
// SMS Marketing Constants
// ============================================================================

export const SMS_PROVIDERS = {
  TWILIO: {
    id: 'TWILIO',
    name: 'Twilio SMS',
    description: 'Global standard for Programmable SMS, 10DLC, and Messaging Services.',
    badge: 'Global Gateway',
    color: '#f22f46', // Twilio Red
    docsUrl: 'https://www.twilio.com/docs/sms',
  },
  AWS_SNS: {
    id: 'AWS_SNS',
    name: 'Amazon SNS SMS',
    description: 'Direct high-throughput cloud SMS with IAM credentials & Origination Numbers.',
    badge: 'AWS Cloud Tier',
    color: '#ff9900', // AWS Orange
    docsUrl: 'https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-sms-token.html',
  },
  SINCH: {
    id: 'SINCH',
    name: 'Sinch SMS',
    description: 'Global Tier-1 carrier network with high deliverability & REST API v1.',
    badge: 'Carrier Tier 1',
    color: '#262626', // Sinch Dark
    docsUrl: 'https://developers.sinch.com/docs/sms/',
  },
  GUPSHUP: {
    id: 'GUPSHUP',
    name: 'Gupshup Enterprise (TRAI DLT)',
    description: 'Enterprise gateway for India & APAC with DLT Header & PE ID compliance.',
    badge: 'DLT Enterprise Ready',
    color: '#00a4d3', // Gupshup Cyan
    docsUrl: 'https://www.gupshup.io/developer/docs/sms-api',
  },
} as const;

export const SMS_CHAR_LIMITS = {
  GSM7_SINGLE_SEGMENT: 160,
  GSM7_MULTI_SEGMENT: 153,
  UNICODE_SINGLE_SEGMENT: 70,
  UNICODE_MULTI_SEGMENT: 67,
} as const;

export const DEFAULT_SMS_MERGE_TAGS = [
  { tag: '{{lead.firstName}}', label: 'Lead First Name', sample: 'Rahul' },
  { tag: '{{lead.fullName}}', label: 'Lead Full Name', sample: 'Rahul Sharma' },
  { tag: '{{project.name}}', label: 'Project Name', sample: 'Skyline Luxuria' },
  { tag: '{{project.startingPrice}}', label: 'Starting Price', sample: '₹1.45 Cr' },
  { tag: '{{project.location}}', label: 'Project Location', sample: 'Bandra West' },
  { tag: '{{agent.name}}', label: 'Agent Name', sample: 'Amit Verma' },
  { tag: '{{agent.phone}}', label: 'Agent Phone', sample: '+91 98765 43210' },
  { tag: '{{shortUrl}}', label: 'Dynamic Short Link', sample: 'https://brk.os/s/x9k2' },
  { tag: '{{optOut}}', label: 'Opt-Out Notice', sample: 'Reply STOP to unsub' },
] as const;

export const DEFAULT_SMS_TEMPLATES = [
  {
    id: 'sms-project-launch',
    name: 'Exclusive Project / Tower Launch',
    category: 'PROJECT_LAUNCH',
    dltTemplateId: 'DLT-110234567890',
    message:
      'Hi {{lead.firstName}}, exclusive pre-launch booking is now open for {{project.name}} starting at {{project.startingPrice}} in {{project.location}}. Download brochure & pricing: {{shortUrl}} - BrokerOS Sales',
  },
  {
    id: 'sms-site-visit',
    name: 'VIP Site Visit Pass & Pickup',
    category: 'SITE_VISIT',
    dltTemplateId: 'DLT-110234567891',
    message:
      'Dear {{lead.firstName}}, your VIP site visit pass for {{project.name}} is confirmed. Book your complimentary cab pickup here: {{shortUrl}} or call {{agent.phone}}.',
  },
  {
    id: 'sms-price-drop',
    name: 'Spot Discount / Price Drop Alert',
    category: 'PRICE_DROP',
    dltTemplateId: 'DLT-110234567892',
    message:
      '🚨 Special Offer: Save up to ₹5 Lacs on selected 2 & 3 BHK residences at {{project.name}} this weekend only. View available units: {{shortUrl}} - {{agent.name}}',
  },
  {
    id: 'sms-cp-commission',
    name: 'Channel Partner 2.5% Spot Commission',
    category: 'CP_COMMISSION',
    dltTemplateId: 'DLT-110234567893',
    message:
      'CP Alert: Earn 2.5% spot commission + instant bonus on client bookings at {{project.name}} this month. Register your buyers: {{shortUrl}}',
  },
] as const;

export const SAMPLE_SMS_CSV_HEADERS = [
  'Full Name',
  'Phone Number',
  'City',
  'Budget (INR)',
  'Interested Project',
  'Lead Temperature (HOT/WARM/COLD)',
] as const;

export const SAMPLE_SMS_CSV_CONTENT = `Full Name,Phone Number,City,Budget (INR),Interested Project,Lead Temperature (HOT/WARM/COLD)
Rahul Sharma,+919876543210,Mumbai,15000000,Skyline Luxuria,HOT
Priya Patel,+919812345678,Pune,8500000,Green Valley,WARM
Amit Verma,+919823456789,Bangalore,22000000,Signature Towers,COLD
Sneha Reddy,+919834567890,Hyderabad,12000000,Skyline Luxuria,HOT
Vikram Malhotra,+919845678901,Delhi NCR,18000000,Signature Towers,WARM
`;


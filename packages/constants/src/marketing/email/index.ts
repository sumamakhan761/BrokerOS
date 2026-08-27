// ============================================================================
// BrokerOS — Email Marketing Constants
// ============================================================================

export const EMAIL_PROVIDERS = {
  SYSTEM_DEFAULT: {
    id: 'SYSTEM_DEFAULT',
    name: 'BrokerOS Default (AWS SES)',
    description: 'Built-in high deliverability email engine. Zero setup required.',
    isDefault: true,
    badge: 'System Master Engine',
    color: '#0284c7', // Sky Blue
  },
  AWS_SES: {
    id: 'AWS_SES',
    name: 'Amazon SES',
    description: 'High-volume enterprise sending with your own AWS account.',
    isDefault: false,
    badge: 'Cost-Effective ($0.10 / 1k)',
    color: '#f97316', // Orange
  },
  SENDGRID: {
    id: 'SENDGRID',
    name: 'SendGrid (Twilio)',
    description: 'Industry-standard marketing and transactional email delivery.',
    isDefault: false,
    badge: 'API Key Connect',
    color: '#1a82e2', // SendGrid Blue
  },
  BREVO: {
    id: 'BREVO',
    name: 'Brevo (formerly Sendinblue)',
    description: 'All-in-one marketing platform with free daily tier.',
    isDefault: false,
    badge: 'Generous Free Tier',
    color: '#0092ff', // Brevo Blue
  },
  MAILCHIMP: {
    id: 'MAILCHIMP',
    name: 'Mailchimp',
    description: 'World-famous marketing platform with rich audience sync.',
    isDefault: false,
    badge: 'OAuth & API Key',
    color: '#ffe01b', // Mailchimp Yellow
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

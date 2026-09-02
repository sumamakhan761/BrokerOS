// ============================================================================
// BrokerOS — Email Marketing Provider Catalog
// ============================================================================

export const EMAIL_PROVIDERS = {
  SYSTEM_DEFAULT: {
    id: 'SYSTEM_DEFAULT',
    type: 'SYSTEM_DEFAULT',
    name: 'BrokerOS Managed SES',
    badge: 'Recommended',
    description: 'Pre-configured AWS SES with dedicated IP warming & 99.4% inbox deliverability.',
    color: '#7C3AED',
    docsUrl: 'https://docs.aws.amazon.com/ses/',
    fields: [],
    requiresCredentials: false,
  },
  AWS_SES: {
    id: 'AWS_SES',
    type: 'AWS_SES',
    name: 'Amazon Simple Email Service (SES)',
    badge: 'High Volume',
    description: 'Connect your own AWS SES account for cost-effective ($0.10/1k) mass email dispatches.',
    color: '#FF9900',
    docsUrl: 'https://docs.aws.amazon.com/ses/',
    fields: [
      { key: 'awsAccessKeyId', label: 'AWS Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'awsSecretKey', label: 'AWS Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', required: true },
      { key: 'awsRegion', label: 'AWS Region', type: 'text', placeholder: 'ap-south-1', required: true },
      { key: 'fromEmail', label: 'Verified Sender Email', type: 'email', placeholder: 'sales@yourbrokerage.com', required: true },
      { key: 'fromName', label: 'Default Sender Name', type: 'text', placeholder: 'Skyline Sales Team', required: true },
    ],
    requiresCredentials: true,
  },
  SENDGRID: {
    id: 'SENDGRID',
    type: 'SENDGRID',
    name: 'Twilio SendGrid',
    badge: 'Analytics',
    description: 'Industry standard for transactional & marketing automation with built-in spam scoring.',
    color: '#0052FF',
    docsUrl: 'https://docs.sendgrid.com/api-reference',
    fields: [
      { key: 'apiKey', label: 'SendGrid API Key', type: 'password', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromEmail', label: 'Verified Sender Email', type: 'email', placeholder: 'campaigns@yourbrokerage.com', required: true },
      { key: 'fromName', label: 'Default Sender Name', type: 'text', placeholder: 'Skyline Luxury Residences', required: true },
    ],
    requiresCredentials: true,
  },
  BREVO: {
    id: 'BREVO',
    type: 'BREVO',
    name: 'Brevo (formerly Sendinblue)',
    badge: 'GDPR / India',
    description: 'European & Asian cloud delivery with strict data isolation & dedicated IP support.',
    color: '#00B96B',
    docsUrl: 'https://developers.brevo.com/',
    fields: [
      { key: 'apiKey', label: 'Brevo v3 API Key', type: 'password', placeholder: 'xkeysib-xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromEmail', label: 'Verified Sender Email', type: 'email', placeholder: 'info@yourbrokerage.com', required: true },
      { key: 'fromName', label: 'Default Sender Name', type: 'text', placeholder: 'Skyline Realty', required: true },
    ],
    requiresCredentials: true,
  },
  MAILCHIMP: {
    id: 'MAILCHIMP',
    type: 'MAILCHIMP',
    name: 'Mailchimp Transactional (Mandrill)',
    badge: 'Legacy',
    description: 'Enterprise transactional email delivery engine with extensive merge-tag template support.',
    color: '#FFE01B',
    docsUrl: 'https://mailchimp.com/developer/transactional/',
    fields: [
      { key: 'apiKey', label: 'Mandrill API Key', type: 'password', placeholder: 'md-xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromEmail', label: 'Sender Email', type: 'email', placeholder: 'sales@yourbrokerage.com', required: true },
      { key: 'fromName', label: 'Default Sender Name', type: 'text', placeholder: 'Sales Gallery', required: true },
    ],
    requiresCredentials: true,
  },
} as const;

export const EMAIL_PROVIDERS_LIST = Object.values(EMAIL_PROVIDERS);

// ============================================================================
// BrokerOS — Voice Telephony Carrier Catalog & Setup Fields
// ============================================================================

export const VOICE_TELEPHONY_PROVIDERS = [
  {
    type: 'TWILIO',
    name: 'Twilio Voice PSTN / SIP Trunking',
    badge: 'Global Tier-1',
    description: 'High-concurrency global telephony with automated Caller ID CNAM, recording, and low PSTN drop rates.',
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumbers', label: 'Caller ID Phone Numbers (comma-separated)', type: 'text', placeholder: '+18xxxxxxxx, +18xxxxxxxxx', required: true },
    ],
    requiresCredentials: true,
  },
  {
    type: 'VOBIZ',
    name: 'Vobiz Telecom (India & International)',
    badge: 'Low Cost / High Concurrency',
    description: 'Specialized enterprise voice termination for high-volume sales outreach across India & Middle East.',
    fields: [
      { key: 'apiKey', label: 'Vobiz API Key / Auth ID', type: 'text', placeholder: 'vbz_live_xxxxxxxxxxxx', required: true },
      { key: 'apiToken', label: 'Vobiz Secret Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumbers', label: 'Assigned Outbound Numbers (comma-separated)', type: 'text', placeholder: '+918035312345', required: true },
    ],
    requiresCredentials: true,
  },
  {
    type: 'EXOTEL',
    name: 'Exotel Cloud Telephony (India DLT Compliant)',
    badge: 'India Enterprise',
    description: 'Leading telecom infrastructure in India with guaranteed local CLI routing, DLT compliance, and call masking.',
    fields: [
      { key: 'accountSid', label: 'Exotel Account SID', type: 'text', placeholder: 'exotel_sid_xxxx', required: true },
      { key: 'apiKey', label: 'Exotel API Key', type: 'text', placeholder: 'xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'apiToken', label: 'Exotel API Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'subdomain', label: 'Exotel API Subdomain', type: 'text', placeholder: 'api.exotel.com', required: true },
      { key: 'fromNumbers', label: 'Virtual Number / Caller ID', type: 'text', placeholder: '08088123456', required: true },
    ],
    requiresCredentials: true,
  },
  {
    type: 'TELNYX',
    name: 'Telnyx Voice API (Private Global Backbone)',
    badge: 'Private Fiber Network',
    description: 'Multi-cloud elastic SIP trunking with sub-millisecond audio packet latency across 60+ countries.',
    fields: [
      { key: 'apiKey', label: 'Telnyx API V2 Key', type: 'password', placeholder: 'KEY01xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'sipDomain', label: 'Telnyx SIP Connection ID (Optional)', type: 'text', placeholder: 'sip.telnyx.com', required: false },
      { key: 'fromNumbers', label: 'Purchased Telnyx Numbers', type: 'text', placeholder: '+13125550199', required: true },
    ],
    requiresCredentials: true,
  },
] as const;

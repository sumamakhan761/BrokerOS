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

// ============================================================================
// Voice & AI Agent Marketing Constants
// ============================================================================

export const VOICE_TELEPHONY_PROVIDERS = {
  TWILIO: {
    id: 'TWILIO',
    name: 'Twilio Voice',
    description: 'Global standard for Programmable Voice, Elastic SIP Trunking, and Media Streams.',
    badge: 'Global Elastic SIP',
    color: '#f22f46',
    docsUrl: 'https://www.twilio.com/docs/voice',
  },
  VOBIZ: {
    id: 'VOBIZ',
    name: 'Vobiz AI Telephony',
    description: 'Programmable Voice API & High-Throughput Bulk Dialer optimized for AI voice agents.',
    badge: 'AI Agent Optimized',
    color: '#6366f1',
    docsUrl: 'https://vobiz.ai',
  },
  EXOTEL: {
    id: 'EXOTEL',
    name: 'Exotel Enterprise (India)',
    description: 'India Tier-1 cloud telephony gateway with ExoPhones and Customer Connect applets.',
    badge: 'India Tier-1 PSTN',
    color: '#10b981',
    docsUrl: 'https://exotel.com',
  },
  TELNYX: {
    id: 'TELNYX',
    name: 'Telnyx Voice',
    description: 'Global carrier network with TeXML, Call Control v2, and direct SIP connections.',
    badge: 'High Concurrency SIP',
    color: '#00e599',
    docsUrl: 'https://telnyx.com/products/voice-api',
  },
  AMAZON_CONNECT: {
    id: 'AMAZON_CONNECT',
    name: 'Amazon Connect Outbound',
    description: 'AWS Enterprise contact center with Contact Flow queues and telephony dispatch.',
    badge: 'AWS Cloud Center',
    color: '#ff9900',
    docsUrl: 'https://docs.aws.amazon.com/connect/',
  },
} as const;

export const VOICE_AGENT_PLATFORMS = {
  VAPI: {
    id: 'VAPI',
    name: 'Vapi AI',
    description: 'Multi-model orchestrator with assistant overrides, transient prompts, and dynamic variables.',
    badge: 'Multi-Model Voice Hub',
    color: '#111827',
    docsUrl: 'https://docs.vapi.ai',
  },
  RETELL: {
    id: 'RETELL',
    name: 'Retell AI',
    description: 'Conversational voice engine with sub-500ms turn-taking and custom SIP trunking.',
    badge: 'Sub-500ms Engine',
    color: '#7c3aed',
    docsUrl: 'https://docs.retellai.com',
  },
  ELEVENLABS: {
    id: 'ELEVENLABS',
    name: 'ElevenLabs Conversational',
    description: 'Industry-leading voice synthesis and conversational AI agents with low latency.',
    badge: 'Ultra-Realistic TTS',
    color: '#2563eb',
    docsUrl: 'https://elevenlabs.io/docs/conversational-ai',
  },
  SARVAM: {
    id: 'SARVAM',
    name: 'Sarvam AI (India)',
    description: 'India-optimized voice AI with Bulbul v3 Indic TTS and Saaras v4 STT (23 languages).',
    badge: 'Indic Languages (Bulbul v3)',
    color: '#ea580c',
    docsUrl: 'https://docs.sarvam.ai',
  },
  BOLNA: {
    id: 'BOLNA',
    name: 'Bolna AI',
    description: 'Open-source/hosted voice agent framework with native Exotel and Twilio connectors.',
    badge: 'Exotel / Twilio Agent',
    color: '#059669',
    docsUrl: 'https://bolna.ai',
  },
  PIPECAT: {
    id: 'PIPECAT',
    name: 'Pipecat AI',
    description: 'Real-time pipeline framework for multimodal AI with Daily WebRTC & SIP transports.',
    badge: 'Daily WebRTC / SIP',
    color: '#0284c7',
    docsUrl: 'https://docs.pipecat.ai',
  },
  LIVEKIT: {
    id: 'LIVEKIT',
    name: 'LiveKit Agents',
    description: 'WebRTC and SIP participant infrastructure for scalable real-time voice bots.',
    badge: 'WebRTC / SIP Participant',
    color: '#dc2626',
    docsUrl: 'https://docs.livekit.io/agents/',
  },
  OPENAI_REALTIME: {
    id: 'OPENAI_REALTIME',
    name: 'OpenAI Realtime API',
    description: 'Native speech-to-speech bidirectional audio model with low-latency WebSockets.',
    badge: 'Speech-to-Speech GPT-4o',
    color: '#000000',
    docsUrl: 'https://platform.openai.com/docs/guides/realtime',
  },
} as const;

export const VOICE_LLM_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'OpenAI',
    badge: 'Fast & Cost-Effective',
    description: 'Optimized for high-speed conversational turns with reliable real estate qualification.',
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    badge: 'Maximum Intelligence',
    description: 'Best for complex high-value client negotiations and deep objection handling.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: 'High Empathy & Context',
    description: 'Natural consultative tone with sophisticated real estate advisory responses.',
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'Groq',
    badge: 'Sub-250ms Extreme Speed',
    description: 'Ultra-low latency inference to achieve instant conversational interruption.',
  },
] as const;

export const VOICE_TTS_CATALOG = [
  // ── ElevenLabs Voices ──
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    provider: '11labs',
    accent: 'American',
    gender: 'Female',
    tags: ['Calm', 'Professional', 'Real Estate Advisor'],
    previewText: 'Hello, I am Rachel from the sales office. Are you interested in our new tower launch?',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    provider: '11labs',
    accent: 'American',
    gender: 'Male',
    tags: ['Authoritative', 'Executive', 'Investment Advisor'],
    previewText: 'Good afternoon. This is Adam calling to discuss pre-launch investment returns.',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    provider: '11labs',
    accent: 'American',
    gender: 'Female',
    tags: ['Energetic', 'Friendly', 'Customer Delight'],
    previewText: 'Hi there! Your VIP site visit pass has been approved. Can we schedule your pickup?',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    provider: '11labs',
    accent: 'American',
    gender: 'Female',
    tags: ['Engaging', 'Warm', 'Pre-Sales'],
    previewText: 'Hi, I saw you were looking for 3 BHK apartments in the prime corridor.',
  },
  // ── Sarvam AI Indic Voices ──
  {
    id: 'sarvam-priya',
    name: 'Priya (Sarvam Bulbul)',
    provider: 'sarvam',
    accent: 'Indian (Hindi / English)',
    gender: 'Female',
    tags: ['Hindi', 'Indian English', 'Natural Prosody'],
    previewText: 'Namaste Rahul ji, main Skyline Luxuria sales team se baat kar rahi hoon.',
  },
  {
    id: 'sarvam-rahul',
    name: 'Rahul (Sarvam Bulbul)',
    provider: 'sarvam',
    accent: 'Indian (Hindi / English)',
    gender: 'Male',
    tags: ['Hindi', 'Indian English', 'Consultative'],
    previewText: 'Namaste! Kya aap is weekend project site visit ke liye aa rahe hain?',
  },
  {
    id: 'sarvam-ananya',
    name: 'Ananya (Sarvam Bulbul)',
    provider: 'sarvam',
    accent: 'Indian (South / English)',
    gender: 'Female',
    tags: ['Multilingual', 'Tamil/English', 'Polite'],
    previewText: 'Vanakkam, I am calling regarding your luxury apartment inquiry in Bangalore.',
  },
  // ── Cartesia Voices ──
  {
    id: 'cartesia-sarah',
    name: 'Sarah (Cartesia Sonic)',
    provider: 'cartesia',
    accent: 'American',
    gender: 'Female',
    tags: ['Sub-150ms', 'Conversational', 'High Energy'],
    previewText: 'Hey! Quick question, are you looking for an investment or ready-to-move home?',
  },
  {
    id: 'cartesia-james',
    name: 'James (Cartesia Sonic)',
    provider: 'cartesia',
    accent: 'British',
    gender: 'Male',
    tags: ['Luxury', 'British', 'Penthouse Sales'],
    previewText: 'Good day. I am presenting the exclusive penthouse collection at Signature Towers.',
  },
  // ── Deepgram Voices ──
  {
    id: 'deepgram-stella',
    name: 'Stella (Deepgram Aura)',
    provider: 'deepgram',
    accent: 'American',
    gender: 'Female',
    tags: ['Crisp', 'Direct', 'Follow-up'],
    previewText: 'Hello, this is Stella following up on your property inquiry from yesterday.',
  },
  // ── OpenAI Realtime Voices ──
  {
    id: 'openai-alloy',
    name: 'Alloy (OpenAI)',
    provider: 'openai',
    accent: 'Neutral',
    gender: 'Neutral',
    tags: ['Balanced', 'Adaptive', 'Realtime GPT-4o'],
    previewText: 'Hi, I am your BrokerOS AI assistant. How can I help you find your dream home today?',
  },
  {
    id: 'openai-shimmer',
    name: 'Shimmer (OpenAI)',
    provider: 'openai',
    accent: 'American',
    gender: 'Female',
    tags: ['Expressive', 'Clear', 'Realtime GPT-4o'],
    previewText: 'Hi! Let me walk you through the pricing and floor plans for Skyline Luxuria.',
  },
] as const;

export const DEFAULT_VOICE_SCRIPTS = [
  {
    id: 'voice-project-launch',
    name: 'Project Pre-Launch Invitation & Qualification',
    category: 'PROJECT_LAUNCH',
    firstMessage:
      'Hi {{lead.firstName}}, this is Rahul calling from the {{project.name}} sales team. Am I speaking with {{lead.fullName}}?',
    systemPrompt: `You are an expert, courteous real estate sales advisor representing {{project.name}}.
Your goal is to qualify the prospect and secure a VIP site visit.

Key Project Information:
- Project Name: {{project.name}}
- Starting Price: {{project.startingPrice}}
- Location: {{project.location}}
- Assigned Senior Sales Executive: {{agent.name}} (Contact: {{agent.phone}})

Conversation Guidelines:
1. Greet the lead by their first name: {{lead.firstName}}.
2. Inform them that exclusive pre-launch bookings have opened for 2 and 3 BHK luxury residences.
3. Ask if they are seeking a home for self-use (end-user) or capital appreciation (investor).
4. If they show interest, offer to schedule a VIP site visit this upcoming Saturday or Sunday with complimentary cab pickup.
5. If they mention high price, explain our 10:90 flexible developer payment plan.
6. Keep your answers concise (1-2 sentences maximum per turn). Never sound like a robot.`,
  },
  {
    id: 'voice-site-visit-pickup',
    name: 'VIP Site Visit Pass & Cab Confirmation',
    category: 'SITE_VISIT',
    firstMessage:
      'Hello {{lead.firstName}}, this is {{agent.name}} from {{project.name}}. I am calling to confirm your VIP site visit pass.',
    systemPrompt: `You are an executive sales assistant confirming an upcoming property site visit for {{project.name}}.

Objective:
1. Confirm the buyer's availability for a site visit this weekend.
2. Ask for their preferred time slot: Morning (11:00 AM) or Afternoon (03:00 PM).
3. Offer a complimentary chauffeured cab pickup from their location in {{lead.city}}.
4. Answer any basic questions about amenities, carpet area, and possession date.`,
  },
  {
    id: 'voice-price-drop',
    name: 'Spot Discount & Inventory Release Alert',
    category: 'PRICE_DROP',
    firstMessage:
      'Hi {{lead.firstName}}, special update from {{project.name}}. We have released 5 exclusive corner units with a spot discount of ₹5 Lacs this weekend only.',
    systemPrompt: `You are an energetic senior sales consultant sharing a limited-time festive/weekend inventory discount.

Objective:
1. Explain that developer management has approved a spot discount of ₹5 Lacs for bookings made before Sunday.
2. Verify if their budget is still around {{lead.budget}} INR.
3. Encourage them to block a unit before the price revises on Monday.`,
  },
  {
    id: 'voice-cp-commission',
    name: 'Channel Partner Spot Commission Boost',
    category: 'CP_COMMISSION',
    firstMessage:
      'Hi {{broker.name}}, this is the Channel Partner desk at {{project.name}}. We are offering an enhanced 2.5% spot commission for all client bookings this month.',
    systemPrompt: `You are a Channel Partner Sourcing Manager speaking with an external registered real estate broker.

Objective:
1. Announce the enhanced 2.5% spot payout + international trip incentive for 3+ bookings.
2. Offer to send updated marketing collaterals and WhatsApp brochures for their clients.
3. Ask how many active buyer inquiries they currently have for {{project.location}}.`,
  },
] as const;

export const SAMPLE_VOICE_CSV_HEADERS = [
  'Full Name',
  'Phone Number',
  'City',
  'Budget (INR)',
  'Interested Project',
  'Lead Temperature (HOT/WARM/COLD)',
] as const;

export const SAMPLE_VOICE_CSV_CONTENT = `Full Name,Phone Number,City,Budget (INR),Interested Project,Lead Temperature (HOT/WARM/COLD)
Rahul Sharma,+919876543210,Mumbai,15000000,Skyline Luxuria,HOT
Priya Patel,+919812345678,Pune,8500000,Green Valley,WARM
Amit Verma,+919823456789,Bangalore,22000000,Signature Towers,COLD
Sneha Reddy,+919834567890,Hyderabad,12000000,Skyline Luxuria,HOT
Vikram Malhotra,+919845678901,Delhi NCR,18000000,Signature Towers,WARM
`;



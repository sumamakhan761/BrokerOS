# BrokerOS Integrations

External service adapters for the BrokerOS platform. Each sub-directory is an isolated adapter for one external service channel. The `apps/api` backend consumes these adapters — it never calls third-party SDKs directly.

---

## Directory

```
integrations/
├── voice/              AI Voice Agents + PSTN Telephony (@brokeros/int-voice)
│   ├── agents/         8 AI voice agent adapters
│   │   ├── vapi/       Vapi assistant management + webhook dispatch
│   │   ├── retell/     Retell AI agent management + webhook dispatch
│   │   ├── sarvam/     Sarvam AI (Bulbul v3) Indic neural TTS + calls
│   │   ├── bolna/      Bolna AI voice agent adapter
│   │   ├── elevenlabs/ ElevenLabs conversational AI adapter
│   │   ├── livekit/    LiveKit WebRTC-based voice pipeline adapter
│   │   ├── openai-realtime/ OpenAI Realtime API adapter
│   │   └── pipecat/    Pipecat open-source voice pipeline adapter
│   ├── bridge/
│   │   └── carrier-bridge-dispatcher.ts  Central PSTN carrier router
│   ├── telephony/      PSTN carrier adapters (Vobiz, Exotel, Twilio, Telnyx)
│   ├── index.ts        Barrel export — exports all adapters + tryCarrierBridgeDispatch
│   └── package.json    Package name: @brokeros/int-voice
│
├── mail/               Email provider adapters
│   ├── sendgrid/       SendGrid transactional + marketing email
│   ├── brevo/          Brevo (Sendinblue) email
│   ├── mailchimp/      Mailchimp bulk email
│   └── aws-ses/        AWS SES email
│
└── sms/                SMS gateway adapters
    ├── twilio/         Twilio SMS
    ├── gupshup/        Gupshup WhatsApp + SMS (India)
    ├── sinch/          Sinch SMS
    └── aws-sns/        AWS SNS SMS
```

---

## Voice Integration (`@brokeros/int-voice`)

The voice integration package is the most complex. It manages two separate layers:

### AI Agent Layer (`integrations/voice/agents/`)
Each AI platform adapter handles:
- **Agent/assistant listing** — fetch all configured agents from the platform workspace
- **Call dispatch** — initiate an outbound AI call to a phone number
- **Catalog fetch** — list available LLM models and TTS voices
- **Webhook processing** — handle inbound call status events

### PSTN Carrier Layer (`integrations/voice/bridge/`)
The `carrier-bridge-dispatcher.ts` provides `tryCarrierBridgeDispatch(phone, config)` — a single function that:
1. Determines the configured telephony carrier (Vobiz / Exotel / Twilio / Telnyx)
2. Dials the number via that carrier's PSTN API
3. Returns a result with the carrier call ID and status

The `apps/workers` `marketing-voice.processor.ts` calls `tryCarrierBridgeDispatch` after dispatching an AI agent call for each lead row in a campaign batch.

---

## Mail Integrations (`integrations/mail/`)

Each provider adapter exports:
- `sendEmail(payload)` — send a single transactional or marketing email
- `validateConfig(config)` — verify API key is valid
- Provider-specific webhook signature verification helpers

---

## SMS Integrations (`integrations/sms/`)

Each provider adapter exports:
- `sendSms(payload)` — dispatch a single SMS message
- `validateConfig(config)` — verify API key is valid
- Provider-specific DLR (delivery receipt) webhook parsers

---

## Rules

1. **Never add provider credentials inside integration code.** All keys come from the root `.env` or are stored encrypted in the `VoiceAgentIntegration` / `EmailIntegration` / `SmsIntegration` DB records.
2. **Never import integrations directly in API controllers.** Route through the corresponding `*-integrations.service.ts` inside `apps/api/src/marketing/`.
3. **When adding a new provider**, create a new sub-directory inside the appropriate channel folder. Export its adapter from the channel's `index.ts`.
4. **Keep adapters thin.** SDK initialization, error normalization, and retry logic only. Business logic stays in `apps/api`.

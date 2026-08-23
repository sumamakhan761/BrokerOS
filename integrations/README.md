# integrations/

One folder per external service. Each integration is a self-contained package.

## Structure convention

```
integrations/
└── <category>/
    └── <provider>/
        ├── package.json        name: "@brokeros/int-<provider>"
        ├── src/
        │   ├── index.ts        exports the provider class
        │   ├── client.ts       HTTP client / SDK wrapper
        │   ├── types.ts        provider-specific types
        │   └── webhooks.ts     incoming webhook handlers
        └── README.md           what this integration does + env vars needed
```

## Adapter Pattern

Every integration implements the interface from `@brokeros/types`:

```typescript
// packages/types/src/integrations.ts
export interface IMessagingProvider {
  sendSMS(to: string, message: string): Promise<void>;
  sendWhatsApp(to: string, message: string, templateId?: string): Promise<void>;
}
```

Then NestJS injects it by interface token, not by concrete class. Swap providers without touching CRM code.

## Planned Integrations

### Telephony
- [ ] `telephony/exotel`    — click-to-call, call recording
- [ ] `telephony/knowlarity` — IVR, missed call leads
- [ ] `telephony/aws-connect` — Amazon Connect call center

### Messaging
- [ ] `messaging/wati`      — WhatsApp Business (official)
- [ ] `messaging/gupshup`   — SMS + WhatsApp
- [ ] `messaging/twilio`    — SMS + voice fallback
- [ ] `messaging/chat360`   — chatbot + WhatsApp

### Real Estate Portals
- [ ] `portals/99acres`
- [ ] `portals/magicbricks`
- [ ] `portals/housing`
- [ ] `portals/nobroker`
- [ ] `portals/squareyards`
- [ ] `portals/commonfloor`
- [ ] `portals/proptiger`

### Ads / Marketing
- [ ] `ads/meta`            — Meta Ads (Facebook + Instagram) lead webhooks
- [ ] `ads/google`          — Google Ads conversion + lead forms
- [ ] `ads/linkedin`        — LinkedIn Lead Gen Forms
- [ ] `ads/youtube`         — YouTube Ads

### Payments
- [ ] `payments/razorpay`
- [ ] `payments/payu`
- [ ] `payments/stripe`

### CRM / Productivity
- [ ] `crm/hubspot`
- [ ] `crm/zoho`
- [ ] `crm/salesforce`
- [ ] `crm/excel`           — Excel import/export
- [ ] `crm/zapier`          — Zap webhooks
- [ ] `crm/google-calendar`
- [ ] `crm/zoom`
- [ ] `crm/gmail`
- [ ] `crm/mailchimp`

### AI
- [ ] `ai/groq`             — already in apps/api, extract here
- [ ] `ai/bedrock`          — Amazon Bedrock
- [ ] `ai/11labs`           — voice synthesis
- [ ] `ai/serveom`          — AI voice agent
- [ ] `ai/vona`             — AI voice agent
- [ ] `ai/wapi`             — WhatsApp AI

### Documents / Finance / Legal
- [ ] `docs/docusign`       — e-signatures
- [ ] `erp/sap`             — SAP ERP commission sync
- [ ] `mail/ses`            — Amazon SES / Pinpoint email
- [ ] `mail/mailchimp`      — bulk email campaigns

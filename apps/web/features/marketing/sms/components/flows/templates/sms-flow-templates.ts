// ============================================================================
// BrokerOS — SMS Flow Automation Templates Registry
// ============================================================================

import type { SmsFlowNode } from '../builder/types';

export interface SmsFlowTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  triggerType: 'keyword_match' | 'any_reply' | 'campaign_reply';
  triggerConfig: Record<string, any>;
  nodes: SmsFlowNode[];
}

export const SMS_FLOW_TEMPLATES: SmsFlowTemplate[] = [
  {
    id: 'site-visit-pass',
    name: 'VIP Site Visit Pass Auto-Responder',
    description: 'Instantly detects site visit or tour intent, sends booking confirmation SMS with showroom hours, and applies CRM tracking tag.',
    badge: 'High Conversion',
    triggerType: 'keyword_match',
    triggerConfig: {
      keywords: ['visit', 'tour', 'site visit', 'schedule', 'location', 'timing', 'see flat'],
      matchType: 'contains',
    },
    nodes: [
      {
        nodeKey: 'reply_site_visit',
        nodeType: 'send_sms',
        config: {
          text: 'Hi {{firstName}}! We would love to host you for a private tour at {{projectName}}. Experience gallery open daily 10AM-7PM. Our sales advisor will call shortly with directions & parking pass.',
        },
        positionX: 100,
        positionY: 100,
      },
      {
        nodeKey: 'tag_visit_req',
        nodeType: 'add_tag',
        config: {
          tagName: 'SITE_VISIT_REQ',
          color: '#10b981',
        },
        positionX: 100,
        positionY: 220,
      },
      {
        nodeKey: 'end_flow',
        nodeType: 'end',
        config: {},
        positionX: 100,
        positionY: 340,
      },
    ],
  },
  {
    id: 'pricing-autoresponder',
    name: 'Instant Pricing & Payment Plan Auto-Responder',
    description: 'Catches inquiries for cost sheets, brochure downloads, or payment plans and delivers immediate structured details.',
    badge: 'Popular',
    triggerType: 'keyword_match',
    triggerConfig: {
      keywords: ['price', 'pricing', 'cost', 'payment plan', 'brochure', 'quote', 'rate', 'emi'],
      matchType: 'contains',
    },
    nodes: [
      {
        nodeKey: 'reply_pricing',
        nodeType: 'send_sms',
        config: {
          text: 'Hi {{firstName}}, luxury residences at {{projectName}} start from {{startingPrice}} with special 20:80 bank plans. View floor plans & cost sheet: {{brochureUrl}}',
        },
        positionX: 100,
        positionY: 100,
      },
      {
        nodeKey: 'tag_pricing_req',
        nodeType: 'add_tag',
        config: {
          tagName: 'PRICING_INQUIRY',
          color: '#8b5cf6',
        },
        positionX: 100,
        positionY: 220,
      },
      {
        nodeKey: 'end_flow',
        nodeType: 'end',
        config: {},
        positionX: 100,
        positionY: 340,
      },
    ],
  },
  {
    id: 'autonomous-ai-concierge',
    name: 'Autonomous AI Concierge (Groq LPU)',
    description: 'Answers incoming prospect questions using Groq openai/gpt-oss-120b in 160 characters or less with project knowledge injection.',
    badge: 'AI Powered',
    triggerType: 'any_reply',
    triggerConfig: {},
    nodes: [
      {
        nodeKey: 'ai_reply_node',
        nodeType: 'ai_agent',
        config: {
          provider: 'groq',
          model: 'openai/gpt-oss-120b',
          instructions: 'Greet the buyer by name, answer pricing or amenities succinctly (under 160 chars), and invite them for an on-site sample flat tour.',
          maxTurns: 3,
          stopIfHumanActive: true,
          handoffOnMax: true,
        },
        positionX: 100,
        positionY: 100,
      },
      {
        nodeKey: 'tag_ai_engaged',
        nodeType: 'add_tag',
        config: {
          tagName: 'AI_ENGAGED',
          color: '#3b82f6',
        },
        positionX: 100,
        positionY: 220,
      },
      {
        nodeKey: 'end_flow',
        nodeType: 'end',
        config: {},
        positionX: 100,
        positionY: 340,
      },
    ],
  },
  {
    id: 'optout-handler',
    name: 'Opt-Out & STOP Compliance Handler',
    description: 'Complies with SMS carrier regulations by recognizing unsubscribe keywords, tagging prospect as UNSUBSCRIBED, and halting outreach.',
    badge: 'Compliance',
    triggerType: 'keyword_match',
    triggerConfig: {
      keywords: ['stop', 'unsubscribe', 'cancel', 'remove', 'quit', 'end'],
      matchType: 'contains',
    },
    nodes: [
      {
        nodeKey: 'reply_unsub',
        nodeType: 'send_sms',
        config: {
          text: 'You have been successfully unsubscribed from {{projectName}} updates. Reply START at any time to opt back in.',
        },
        positionX: 100,
        positionY: 100,
      },
      {
        nodeKey: 'tag_unsub',
        nodeType: 'add_tag',
        config: {
          tagName: 'UNSUBSCRIBED',
          color: '#ef4444',
        },
        positionX: 100,
        positionY: 220,
      },
      {
        nodeKey: 'end_flow',
        nodeType: 'end',
        config: {},
        positionX: 100,
        positionY: 340,
      },
    ],
  },
];

// ============================================================================
// BrokerOS — Email Flow Automation Templates Registry
// ============================================================================

import type { EmailFlowNode } from '@/features/marketing/types';

export interface EmailFlowTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  triggerType: 'keyword_match' | 'any_reply' | 'campaign_reply';
  triggerConfig: Record<string, any>;
  nodes: EmailFlowNode[];
}

export const EMAIL_FLOW_TEMPLATES: EmailFlowTemplate[] = [
  {
    id: 'site-visit-booking',
    name: 'Site Visit Booking Auto-responder',
    description: 'Instantly detects site visit intent, delivers calendar scheduling details, flags lead as HOT, and alerts Pre-Sales Manager.',
    badge: 'High Conversion',
    triggerType: 'keyword_match',
    triggerConfig: {
      keywords: ['visit', 'tour', 'schedule', 'see property', 'book visit', 'timing', 'location'],
      matchType: 'contains',
    },
    nodes: [
      {
        nodeKey: 'reply_site_visit',
        nodeType: 'send_email',
        config: {
          subject: 'Confirming your site visit to {{project_name}}',
          bodyHtml: `<p>Hello {{lead_name}},</p>
<p>We would be thrilled to host you for an exclusive private site visit at <strong>{{project_name}}</strong>!</p>
<p>Our sales experience gallery is open daily from <strong>10:00 AM to 7:00 PM</strong>. You will be able to tour the designer show homes, explore the master floor plans, and review inventory availability.</p>
<p>A dedicated senior sales advisor has been notified and will call you shortly to confirm your preferred timing and arrange complimentary valet parking.</p>
<p>Warm regards,<br><strong>{{project_name}} Sales & Advisory Team</strong></p>`,
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
        nodeKey: 'update_lead_hot',
        nodeType: 'update_lead',
        config: {
          status: 'INTERESTED',
          temperature: 'HOT',
          scoreIncrement: 25,
        },
        positionX: 100,
        positionY: 340,
      },
      {
        nodeKey: 'handoff_presales',
        nodeType: 'pre_sales_handoff',
        config: {
          priority: 'URGENT',
          note: 'Inbound email requested site visit tour',
        },
        positionX: 100,
        positionY: 460,
      },
    ],
  },
  {
    id: 'pricing-autoresponder',
    name: 'Pricing & Payment Plan Auto-responder',
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
        nodeType: 'send_email',
        config: {
          subject: 'Official Pricing & Payment Schedule — {{project_name}}',
          bodyHtml: `<p>Hello {{lead_name}},</p>
<p>Thank you for inquiring about pricing for <strong>{{project_name}}</strong>.</p>
<p>Here is an overview of our current release pricing:</p>
<ul>
  <li><strong>2 BHK Luxury Suites:</strong> Starting from ₹85 Lakhs onwards</li>
  <li><strong>3 BHK Signature Residences:</strong> Starting from ₹1.25 Cr onwards</li>
  <li><strong>Special Construction-Linked 20:80 Payment Plan</strong> with zero pre-EMI options available this month.</li>
</ul>
<p>Would you like us to email you the complete itemized cost sheet and architectural floor plans?</p>
<p>Best regards,<br><strong>Sales Desk</strong></p>`,
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
        nodeKey: 'update_lead_warm',
        nodeType: 'update_lead',
        config: {
          status: 'INTERESTED',
          temperature: 'WARM',
          scoreIncrement: 15,
        },
        positionX: 100,
        positionY: 340,
      },
    ],
  },
  {
    id: 'autonomous-ai-concierge',
    name: 'Autonomous AI Concierge (Groq LPU)',
    description: 'Answers any incoming prospect question using Groq openai/gpt-oss-120b with real-time property knowledge injection.',
    badge: 'AI Powered',
    triggerType: 'any_reply',
    triggerConfig: {},
    nodes: [
      {
        nodeKey: 'ai_reply_node',
        nodeType: 'ai_reply',
        config: {
          provider: 'groq',
          model: 'openai/gpt-oss-120b',
          instructions: 'Greet the prospect by name, answer their specific property questions with confidence, and invite them for an on-site visit.',
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
    ],
  },
  {
    id: 'optout-handler',
    name: 'Opt-Out & Unsubscribe Handler',
    description: 'Complies with email anti-spam laws by recognizing unsubscribe requests and marking leads as LOST in CRM.',
    badge: 'Compliance',
    triggerType: 'keyword_match',
    triggerConfig: {
      keywords: ['stop', 'unsubscribe', 'remove', 'do not email', 'not interested', 'cancel'],
      matchType: 'contains',
    },
    nodes: [
      {
        nodeKey: 'reply_unsub',
        nodeType: 'send_email',
        config: {
          subject: 'You have been unsubscribed',
          bodyHtml: `<p>Hello,</p><p>You have been successfully removed from our email communications list for this project. We apologize for any inconvenience.</p>`,
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
        nodeKey: 'update_lead_lost',
        nodeType: 'update_lead',
        config: {
          status: 'LOST',
          temperature: 'COLD',
        },
        positionX: 100,
        positionY: 340,
      },
    ],
  },
];

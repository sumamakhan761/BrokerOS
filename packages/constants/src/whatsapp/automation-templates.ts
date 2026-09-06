// ============================================================================
// BrokerOS — WhatsApp Automation Pre-Built Templates
// ============================================================================

export type TemplateSlug =
  | 'welcome_message'
  | 'out_of_office'
  | 'lead_qualifier'
  | 'follow_up_reminder';

export interface TemplateStepSeed {
  step_type: string;
  step_config: Record<string, any>;
  branch?: 'yes' | 'no' | null;
  parent_index?: number | null;
}

export interface AutomationTemplateDefinition {
  slug: TemplateSlug;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  steps: TemplateStepSeed[];
}

export const AUTOMATION_TEMPLATES: Record<TemplateSlug, AutomationTemplateDefinition> = {
  welcome_message: {
    slug: 'welcome_message',
    name: 'Welcome Message',
    description: 'Auto-reply to first-time contacts with a warm greeting and auto-tag.',
    trigger_type: 'first_inbound_message',
    trigger_config: {},
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: "Hi! 👋 Thanks for reaching out to our brokerage. How can our team assist your real estate journey today?",
        },
      },
      {
        step_type: 'add_tag',
        step_config: { tag_name: 'New Lead' },
      },
    ],
  },
  out_of_office: {
    slug: 'out_of_office',
    name: 'Out of Office',
    description: 'Auto-reply during off-hours so prospective buyers are never left waiting.',
    trigger_type: 'new_message_received',
    trigger_config: {},
    steps: [
      {
        step_type: 'condition',
        step_config: {
          subject: 'time_of_day',
          operand: '19:00-09:00',
        },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: "Thanks for contacting us! Our real estate advisory team is currently offline (Operating Hours: 9am–7pm). We will get back to you first thing tomorrow morning!",
        },
        parent_index: 0,
        branch: 'yes',
      },
    ],
  },
  lead_qualifier: {
    slug: 'lead_qualifier',
    name: 'Real Estate Lead Qualifier',
    description: 'Detect pricing/brochure keywords and immediately trigger qualification.',
    trigger_type: 'keyword_match',
    trigger_config: {
      keywords: ['price', 'pricing', 'brochure', 'floor plan', 'booking'],
      match_type: 'contains',
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: "Delighted to assist you with pricing and project floor plans! Are you looking for an investment or for end-use?",
        },
      },
      {
        step_type: 'wait_delay',
        step_config: { amount: 15, unit: 'minutes' },
      },
      {
        step_type: 'assign_agent',
        step_config: {},
      },
    ],
  },
  follow_up_reminder: {
    slug: 'follow_up_reminder',
    name: 'Follow-Up Reminder',
    description: 'Nudge silent leads 24 hours after initial site visit or price discussion.',
    trigger_type: 'tag_added',
    trigger_config: { tag_name: 'Follow Up' },
    steps: [
      {
        step_type: 'wait_delay',
        step_config: { amount: 24, unit: 'hours' },
      },
      {
        step_type: 'condition',
        step_config: {
          subject: 'contact_replied_since',
          operand: '24_hours',
        },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: "Hi there! Just following up to see if you had any questions regarding the property details we shared yesterday?",
        },
        parent_index: 1,
        branch: 'no',
      },
    ],
  },
};

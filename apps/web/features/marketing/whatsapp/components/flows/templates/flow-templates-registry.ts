// ============================================================================
// BrokerOS — WhatsApp Flow Bot Templates Registry & Node Initializers
// ============================================================================

import React from 'react';
import { Building2, MessageSquare, HelpCircle } from 'lucide-react';

export interface FlowTemplateItem {
  slug: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  nodes: number;
}

export interface FlowTemplateNode {
  nodeKey: string;
  nodeType: string;
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

export interface FlowTemplateStructure {
  triggerType: string;
  triggerConfig: Record<string, any>;
  nodes: FlowTemplateNode[];
}

export const FLOW_TEMPLATES: FlowTemplateItem[] = [
  {
    slug: 'lead_qualifier',
    name: 'Lead Budget & Property Qualifier',
    desc: 'Interactive branching bot asking 2BHK/3BHK, budget bracket, and timeline.',
    icon: Building2,
    nodes: 6,
  },
  {
    slug: 'brochure_dispenser',
    name: 'Instant Brochure & Pricing Sheet',
    desc: 'Auto-delivers project documents when customer replies "brochure" or "pricing".',
    icon: MessageSquare,
    nodes: 4,
  },
  {
    slug: 'site_visit_assistant',
    name: 'Site Visit Booking Assistant',
    desc: 'Collects preferred visit date/time and notifies sales advisor immediately.',
    icon: HelpCircle,
    nodes: 5,
  },
];

export function getNodesForTemplate(slugOrName?: string): FlowTemplateStructure {
  if (
    slugOrName === 'lead_qualifier' ||
    slugOrName === 'Lead Budget & Property Qualifier'
  ) {
    return {
      triggerType: 'keyword',
      triggerConfig: {
        keywords: ['property', 'bhk', 'apartment', 'budget', 'price'],
      },
      nodes: [
        {
          nodeKey: 'start',
          nodeType: 'start',
          config: { next_node_key: 'qualifier_q1' },
          positionX: 100,
          positionY: 80,
        },
        {
          nodeKey: 'qualifier_q1',
          nodeType: 'send_buttons',
          config: {
            body: 'Welcome to BrokerOS! What apartment configuration are you looking for?',
            buttons: [
              {
                reply_id: 'bhk_2',
                title: '2 BHK',
                next_node_key: 'qualifier_q2',
              },
              {
                reply_id: 'bhk_3',
                title: '3 BHK',
                next_node_key: 'qualifier_q2',
              },
              {
                reply_id: 'bhk_4',
                title: '4 BHK Luxury',
                next_node_key: 'qualifier_q2',
              },
            ],
          },
          positionX: 100,
          positionY: 200,
        },
        {
          nodeKey: 'qualifier_q2',
          nodeType: 'collect_input',
          config: {
            prompt:
              'Great! What is your estimated investment budget range? (e.g. ₹1.5 Cr - ₹2.5 Cr)',
            var_name: 'budget',
            next_node_key: 'qualifier_tag',
          },
          positionX: 100,
          positionY: 340,
        },
        {
          nodeKey: 'qualifier_tag',
          nodeType: 'set_tag',
          config: {
            tag_name: 'Qualified Lead',
            mode: 'add',
            next_node_key: 'qualifier_handoff',
          },
          positionX: 100,
          positionY: 480,
        },
        {
          nodeKey: 'qualifier_handoff',
          nodeType: 'handoff',
          config: {
            note: 'Qualified buyer ready for curated project brochures',
          },
          positionX: 100,
          positionY: 620,
        },
      ],
    };
  }

  if (
    slugOrName === 'brochure_dispenser' ||
    slugOrName === 'Instant Brochure & Pricing Sheet'
  ) {
    return {
      triggerType: 'keyword',
      triggerConfig: {
        keywords: ['brochure', 'pricing', 'price sheet', 'plans'],
      },
      nodes: [
        {
          nodeKey: 'start',
          nodeType: 'start',
          config: { next_node_key: 'send_brochure_msg' },
          positionX: 100,
          positionY: 80,
        },
        {
          nodeKey: 'send_brochure_msg',
          nodeType: 'send_message',
          config: {
            text: 'Hello! Here is our latest verified project brochure and official pricing inventory sheet.',
            next_node_key: 'send_options',
          },
          positionX: 100,
          positionY: 200,
        },
        {
          nodeKey: 'send_options',
          nodeType: 'send_buttons',
          config: {
            body: 'Would you like to schedule a site visit or connect with a dedicated property advisor?',
            buttons: [
              {
                reply_id: 'btn_visit',
                title: 'Schedule Site Visit',
                next_node_key: 'end_flow',
              },
              {
                reply_id: 'btn_call',
                title: 'Request Call',
                next_node_key: 'end_flow',
              },
            ],
          },
          positionX: 100,
          positionY: 340,
        },
        {
          nodeKey: 'end_flow',
          nodeType: 'end',
          config: {},
          positionX: 100,
          positionY: 480,
        },
      ],
    };
  }

  if (
    slugOrName === 'site_visit_assistant' ||
    slugOrName === 'Site Visit Booking Assistant'
  ) {
    return {
      triggerType: 'keyword',
      triggerConfig: {
        keywords: ['visit', 'site visit', 'tour', 'inspect'],
      },
      nodes: [
        {
          nodeKey: 'start',
          nodeType: 'start',
          config: { next_node_key: 'ask_date' },
          positionX: 100,
          positionY: 80,
        },
        {
          nodeKey: 'ask_date',
          nodeType: 'collect_input',
          config: {
            prompt:
              'We would love to host you for a private site inspection! What date and time works best for you? (e.g. Tomorrow at 3 PM)',
            var_name: 'visit_slot',
            next_node_key: 'confirm_msg',
          },
          positionX: 100,
          positionY: 200,
        },
        {
          nodeKey: 'confirm_msg',
          nodeType: 'send_message',
          config: {
            text: 'Thank you! Your private visit request has been logged. Our property manager will prepare your VIP gate pass.',
            next_node_key: 'tag_visit',
          },
          positionX: 100,
          positionY: 340,
        },
        {
          nodeKey: 'tag_visit',
          nodeType: 'set_tag',
          config: {
            tag_name: 'Site Visit Requested',
            mode: 'add',
            next_node_key: 'handoff_advisor',
          },
          positionX: 100,
          positionY: 480,
        },
        {
          nodeKey: 'handoff_advisor',
          nodeType: 'handoff',
          config: {
            note: 'Site visit booked via WhatsApp',
          },
          positionX: 100,
          positionY: 620,
        },
      ],
    };
  }

  // Default custom flow
  return {
    triggerType: 'keyword',
    triggerConfig: { keywords: ['hello', 'hi', 'inquiry'] },
    nodes: [
      {
        nodeKey: 'start',
        nodeType: 'start',
        config: { next_node_key: 'welcome_msg' },
        positionX: 100,
        positionY: 80,
      },
      {
        nodeKey: 'welcome_msg',
        nodeType: 'send_message',
        config: {
          text: 'Hello! Thanks for reaching out to BrokerOS. How can our team assist you today?',
        },
        positionX: 100,
        positionY: 220,
      },
    ],
  };
}

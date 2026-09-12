// ============================================================================
// BrokerOS — SMS Flow Node Types & Metadata Config
// ============================================================================

import {
  PlayCircle,
  MessageSquare,
  Sparkles,
  GitFork,
  Tag,
  Flag,
} from 'lucide-react';

export type SmsFlowNodeType =
  | 'start'
  | 'send_sms'
  | 'ai_agent'
  | 'condition'
  | 'add_tag'
  | 'end';

export interface SmsFlowNode {
  id?: string;
  nodeKey: string;
  nodeType: SmsFlowNodeType;
  config: Record<string, any>;
  branches?: {
    yes: SmsFlowNode[];
    no: SmsFlowNode[];
  };
  positionX?: number;
  positionY?: number;
}

export interface SmsFlowData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  triggerType: 'keyword_match' | 'any_reply' | 'campaign_reply';
  triggerConfig?: {
    keywords?: string[];
    matchType?: 'contains' | 'exact' | 'starts_with';
  };
  isGlobal: boolean;
  campaignIds?: string[];
  projectId?: string;
  projectName?: string;
  nodes: SmsFlowNode[];
  createdAt?: string;
  updatedAt?: string;
}

export const SMS_NODE_TYPES_META: Record<
  SmsFlowNodeType,
  { label: string; icon: any; color: string; desc: string }
> = {
  start: {
    label: 'Start Entry',
    icon: PlayCircle,
    color: 'text-emerald-500 bg-emerald-500/10 border-l-emerald-500',
    desc: 'Inbound SMS carrier webhook trigger entry',
  },
  send_sms: {
    label: 'Send SMS Reply',
    icon: MessageSquare,
    color: 'text-amber-500 bg-amber-500/10 border-l-amber-500',
    desc: 'Send character-optimized SMS reply with merge tags',
  },
  ai_agent: {
    label: 'Groq AI SMS Concierge',
    icon: Sparkles,
    color: 'text-purple-600 bg-purple-500/10 border-l-purple-600',
    desc: 'Groq LPU (openai/gpt-oss-120b) generates succinct response (<= 160 chars)',
  },
  condition: {
    label: 'If / Else Branch',
    icon: GitFork,
    color: 'text-fuchsia-500 bg-fuchsia-500/10 border-l-fuchsia-500',
    desc: 'Dual-branch based on keywords, intent, or price inquiry',
  },
  add_tag: {
    label: 'Assign CRM Tag',
    icon: Tag,
    color: 'text-pink-500 bg-pink-500/10 border-l-pink-500',
    desc: 'Tag prospect using CRM tags from SMS Settings',
  },
  end: {
    label: 'End Flow',
    icon: Flag,
    color: 'text-zinc-500 bg-zinc-500/10 border-l-zinc-500',
    desc: 'Terminate automation sequence',
  },
};

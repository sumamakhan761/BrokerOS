// ============================================================================
// BrokerOS — Email Flow Node Types & Metadata Config
// ============================================================================

import {
  PlayCircle,
  Mail,
  Sparkles,
  GitFork,
  UserCheck,
  Tag,
  UserPlus,
  Flag,
} from 'lucide-react';

export type EmailFlowNodeType =
  | 'start'
  | 'send_email'
  | 'ai_agent'
  | 'condition'
  | 'add_tag'
  | 'end';

export interface EmailFlowNode {
  id?: string;
  nodeKey: string;
  nodeType: EmailFlowNodeType;
  config: Record<string, any>;
  branches?: {
    yes: EmailFlowNode[];
    no: EmailFlowNode[];
  };
  positionX?: number;
  positionY?: number;
}

export interface EmailFlowData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  triggerType: 'keyword_match' | 'any_reply';
  triggerConfig?: {
    keywords?: string[];
    matchType?: 'contains' | 'exact' | 'starts_with';
  };
  isGlobal: boolean;
  campaignIds?: string[];
  projectId?: string;
  projectName?: string;
  nodes: EmailFlowNode[];
}

export const EMAIL_NODE_TYPES_META: Record<
  EmailFlowNodeType,
  { label: string; icon: any; color: string; desc: string }
> = {
  start: {
    label: 'Start Entry',
    icon: PlayCircle,
    color: 'text-emerald-500 bg-emerald-500/10 border-l-emerald-500',
    desc: 'Inbound email trigger entry point',
  },
  send_email: {
    label: 'Send Email Reply',
    icon: Mail,
    color: 'text-sky-500 bg-sky-500/10 border-l-sky-500',
    desc: 'Send custom email with subject & body merge tags',
  },
  ai_agent: {
    label: 'AI Concierge Autoreply',
    icon: Sparkles,
    color: 'text-purple-600 bg-purple-500/10 border-l-purple-600',
    desc: 'Groq openai/gpt-oss-120b answers with project details',
  },
  condition: {
    label: 'If / Else Branch',
    icon: GitFork,
    color: 'text-fuchsia-500 bg-fuchsia-500/10 border-l-fuchsia-500',
    desc: 'Branch based on inquiry keywords or intent',
  },
  add_tag: {
    label: 'Assign CRM Tag',
    icon: Tag,
    color: 'text-pink-500 bg-pink-500/10 border-l-pink-500',
    desc: 'Tag prospect using existing CRM tags from Settings',
  },
  end: {
    label: 'End Flow',
    icon: Flag,
    color: 'text-zinc-500 bg-zinc-500/10 border-l-zinc-500',
    desc: 'Terminate this automation sequence',
  },
};

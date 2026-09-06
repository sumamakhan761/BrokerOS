import type { WhatsAppStepType, WhatsAppTriggerType } from '@brokeros/types';
import {
  MessageSquare,
  FileText,
  Tag,
  TagIcon,
  UserCheck,
  PencilLine,
  Briefcase,
  Hourglass,
  GitBranch,
  Webhook,
  CircleSlash,
  Zap,
  MousePointerClick,
  List,
} from 'lucide-react';

export interface BuilderStep {
  cid: string;
  step_type: WhatsAppStepType;
  step_config: Record<string, unknown>;
  branches?: { yes: BuilderStep[]; no: BuilderStep[] };
}

export interface BuilderInitial {
  id?: string;
  name: string;
  description?: string;
  trigger_type: WhatsAppTriggerType;
  trigger_config: Record<string, unknown>;
  is_active: boolean;
  steps: BuilderStep[];
}

export interface ServerStepNode {
  id: string;
  stepType?: string;
  step_type?: string;
  stepConfig?: Record<string, unknown>;
  step_config?: Record<string, unknown>;
  branches?: { yes?: ServerStepNode[]; no?: ServerStepNode[] };
}

export interface StepMeta {
  label: string;
  icon: typeof Zap;
  accent: string;
  badge: string;
}

export const STEP_META: Record<WhatsAppStepType, StepMeta> = {
  send_message: { label: 'Send Text Message', icon: MessageSquare, accent: 'border-l-brand-600', badge: 'bg-brand-500/10 text-brand-600' },
  send_buttons: { label: 'Send Reply Buttons', icon: MousePointerClick, accent: 'border-l-blue-600', badge: 'bg-blue-500/10 text-blue-600' },
  send_list: { label: 'Send List Menu', icon: List, accent: 'border-l-indigo-600', badge: 'bg-indigo-500/10 text-indigo-600' },
  send_template: { label: 'Send Approved Template (HSM)', icon: FileText, accent: 'border-l-emerald-600', badge: 'bg-emerald-500/10 text-emerald-600' },
  add_tag: { label: 'Add Tag to Contact', icon: Tag, accent: 'border-l-amber-600', badge: 'bg-amber-500/10 text-amber-600' },
  remove_tag: { label: 'Remove Tag from Contact', icon: TagIcon, accent: 'border-l-orange-600', badge: 'bg-orange-500/10 text-orange-600' },
  assign_conversation: { label: 'Assign Conversation to Agent', icon: UserCheck, accent: 'border-l-purple-600', badge: 'bg-purple-500/10 text-purple-600' },
  update_contact_field: { label: 'Update Contact Field', icon: PencilLine, accent: 'border-l-cyan-600', badge: 'bg-cyan-500/10 text-cyan-600' },
  create_deal: { label: 'Create Pipeline Deal', icon: Briefcase, accent: 'border-l-rose-600', badge: 'bg-rose-500/10 text-rose-600' },
  wait: { label: 'Delay / Wait', icon: Hourglass, accent: 'border-l-slate-400', badge: 'bg-slate-500/10 text-slate-600' },
  condition: { label: 'Branch / If Condition', icon: GitBranch, accent: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-600' },
  send_webhook: { label: 'Trigger External Webhook', icon: Webhook, accent: 'border-l-sky-600', badge: 'bg-sky-500/10 text-sky-600' },
  close_conversation: { label: 'Close Conversation', icon: CircleSlash, accent: 'border-l-zinc-500', badge: 'bg-zinc-500/10 text-zinc-600' },
};

export const ADDABLE_STEPS: WhatsAppStepType[] = [
  'send_message',
  'send_buttons',
  'send_list',
  'send_template',
  'add_tag',
  'remove_tag',
  'assign_conversation',
  'update_contact_field',
  'create_deal',
  'wait',
  'condition',
  'send_webhook',
  'close_conversation',
];

export const TRIGGER_OPTIONS: { value: WhatsAppTriggerType; label: string; desc: string }[] = [
  { value: 'new_message_received', label: 'Any Incoming Message', desc: 'Runs whenever a customer sends any WhatsApp message' },
  { value: 'first_inbound_message', label: 'First Inbound Message', desc: 'Triggered only when a new lead talks to us for the very first time' },
  { value: 'keyword_match', label: 'Keyword Match', desc: 'Runs when inbound text matches exact keywords or patterns (e.g. "price", "brochure")' },
  { value: 'interactive_reply', label: 'Interactive Reply', desc: 'Runs when a customer taps a specific button or selects a list menu option' },
  { value: 'new_contact_created', label: 'New Contact Created', desc: 'Triggered when a new contact is added or synced into WhatsApp CRM' },
  { value: 'conversation_assigned', label: 'Conversation Assigned', desc: 'Runs when an admin or manager assigns the chat to a sales rep' },
  { value: 'tag_added', label: 'Tag Added to Contact', desc: 'Runs when a specific tag (e.g. "VIP", "Site Visit") is attached' },
  { value: 'time_based', label: 'Scheduled / Inactivity Timer', desc: 'Triggered after no response for X hours or days' },
];

export interface TagItem {
  id: string;
  name: string;
  color?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  language?: string;
  category?: string;
}

export interface CustomFieldItem {
  id: string;
  fieldName: string;
  fieldType: string;
}

export interface PipelineItem {
  id: string;
  name: string;
}

export interface StageItem {
  id: string;
  name: string;
  pipelineId: string;
  position: number;
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
}

export interface AutomationResources {
  tags: TagItem[];
  templates: TemplateItem[];
  customFields: CustomFieldItem[];
  pipelines: PipelineItem[];
  stages: StageItem[];
  members: MemberItem[];
}

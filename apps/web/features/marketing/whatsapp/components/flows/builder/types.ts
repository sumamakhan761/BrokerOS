import {
  PlayCircle,
  MessageCircle,
  ListChecks,
  ListPlus,
  Paperclip,
  Inbox,
  GitFork,
  Tag,
  UserPlus,
  Flag,
} from 'lucide-react';

export type FlowNodeType =
  | 'start'
  | 'send_message'
  | 'send_buttons'
  | 'send_list'
  | 'send_media'
  | 'collect_input'
  | 'condition'
  | 'set_tag'
  | 'handoff'
  | 'end';

export interface FlowNode {
  id?: string;
  nodeKey: string;
  nodeType: FlowNodeType;
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

export interface FlowData {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  triggerType: string;
  triggerConfig?: any;
  nodes: FlowNode[];
}

export const NODE_TYPES_META: Record<
  FlowNodeType,
  { label: string; icon: any; color: string; desc: string }
> = {
  start: { label: 'Start Entry', icon: PlayCircle, color: 'text-emerald-500 bg-emerald-500/10 border-l-emerald-500', desc: 'Entry point of flow' },
  send_message: { label: 'Send Text Message', icon: MessageCircle, color: 'text-sky-500 bg-sky-500/10 border-l-sky-500', desc: 'Sends a text message' },
  send_buttons: { label: 'Send Quick Reply Buttons', icon: ListChecks, color: 'text-brand-600 bg-brand-500/10 border-l-brand-600', desc: 'Up to 3 reply buttons' },
  send_list: { label: 'Send List Menu', icon: ListPlus, color: 'text-indigo-500 bg-indigo-500/10 border-l-indigo-500', desc: 'Interactive dropdown list' },
  send_media: { label: 'Send Media (Image / PDF)', icon: Paperclip, color: 'text-cyan-500 bg-cyan-500/10 border-l-cyan-500', desc: 'Brochure or floor plan' },
  collect_input: { label: 'Ask Question & Save Reply', icon: Inbox, color: 'text-teal-500 bg-teal-500/10 border-l-teal-500', desc: 'Captures user response in CRM' },
  condition: { label: 'If / Else Branch', icon: GitFork, color: 'text-fuchsia-500 bg-fuchsia-500/10 border-l-fuchsia-500', desc: 'Branches on budget, tag, etc.' },
  set_tag: { label: 'Add / Remove Tag', icon: Tag, color: 'text-pink-500 bg-pink-500/10 border-l-pink-500', desc: 'Updates contact tags' },
  handoff: { label: 'Handoff to Human Agent', icon: UserPlus, color: 'text-amber-500 bg-amber-500/10 border-l-amber-500', desc: 'Transfers chat to sales exec' },
  end: { label: 'End Flow', icon: Flag, color: 'text-zinc-500 bg-zinc-500/10 border-l-zinc-500', desc: 'Terminates the workflow' },
};

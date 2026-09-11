// ============================================================================
// BrokerOS — SMS Conversation Header Component
// ============================================================================

import React from 'react';
import {
  Phone,
  User,
  Sparkles,
  Bot,
  PanelRightOpen,
  PanelRightClose,
  Lock,
} from 'lucide-react';
import type { SmsConversation } from '../../types/inbox';
import { SMS_PROVIDERS } from '@brokeros/constants';

interface SmsConversationHeaderProps {
  conversation: SmsConversation;
  onUpdateStatus: (status: 'open' | 'pending' | 'closed') => void;
  onAssignAgent?: () => void;
  onToggleAi: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export const SmsConversationHeader: React.FC<SmsConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onToggleAi,
  isDrawerOpen,
  onToggleDrawer,
}) => {
  const provMeta =
    (SMS_PROVIDERS as Record<string, any>)[conversation.assignedProvider] || SMS_PROVIDERS.TWILIO;

  const contactName =
    conversation.contactName ||
    (conversation.lead
      ? `${conversation.lead.firstName || ''} ${conversation.lead.lastName || ''}`.trim()
      : null) ||
    conversation.contactPhone;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white shadow-2xs">
      {/* Left: Contact Info & Thread Continuity Invariant Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-extrabold text-xs shrink-0">
          <Phone className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">{contactName}</h3>
            {conversation.lead && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                CRM Lead
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="font-mono font-bold text-slate-700">{conversation.contactPhone}</span>
            <span>•</span>
            {/* Thread Continuity Indicator */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3 text-slate-400" />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: provMeta.color }}
              />
              <span>Route: {provMeta.name}</span>
              <span className="font-mono text-slate-500 font-normal">({conversation.assignedSenderPhone})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Autoreply Toggle */}
        <button
          type="button"
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
            conversation.aiAutoReplyDisabled
              ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 shadow-2xs'
          }`}
          title={conversation.aiAutoReplyDisabled ? 'AI Autoreply Disabled' : 'AI Autoreply Active'}
        >
          <Sparkles className={`w-3.5 h-3.5 ${conversation.aiAutoReplyDisabled ? 'text-slate-400' : 'text-purple-600'}`} />
          <span>{conversation.aiAutoReplyDisabled ? 'AI Paused' : 'AI Concierge On'}</span>
        </button>

        {/* Status Dropdown */}
        <select
          value={conversation.status}
          onChange={(e) => onUpdateStatus(e.target.value as any)}
          className="text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 capitalize cursor-pointer focus:outline-none focus:border-amber-500"
        >
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>

        {/* Contact Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleDrawer}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title={isDrawerOpen ? 'Close CRM Drawer' : 'View CRM Contact Details'}
        >
          {isDrawerOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

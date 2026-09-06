// ============================================================================
// BrokerOS — WhatsApp Conversation Header Component
// ============================================================================

import React from 'react';
import {
  Phone,
  UserCheck,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import type { WhatsAppConversation } from '../../types';

interface ConversationHeaderProps {
  conversation: WhatsAppConversation;
  onUpdateStatus: (status: 'open' | 'pending' | 'closed') => void;
  onAssignAgent: (agentUserId: string | null) => void;
  onToggleContactDrawer?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onAssignAgent,
  onToggleContactDrawer,
}) => {
  const contactName =
    conversation.contact?.name || conversation.contactName || conversation.contactPhone;

  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-b border-border-default shrink-0">
      {/* Contact Profile & Quick Info */}
      <div className="flex items-center gap-3.5">
        <div
          onClick={onToggleContactDrawer}
          className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
        >
          {contactName.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3
              onClick={onToggleContactDrawer}
              className="font-semibold text-text-primary text-sm hover:text-brand-600 cursor-pointer transition-colors"
            >
              {contactName}
            </h3>

            {/* Linked CRM Lead Badge */}
            {conversation.contact?.lead && (
              <Link
                href={`/dashboard/leads/${conversation.contact.lead.id}`}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100 transition-colors"
                title="View linked BrokerOS Lead"
              >
                <span>Lead</span>
                {conversation.contact.lead.temperature && (
                  <span className="font-bold">· {conversation.contact.lead.temperature}</span>
                )}
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{conversation.contactPhone}</span>
            {conversation.contact?.company && (
              <>
                <span>•</span>
                <span>{conversation.contact.company}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Status Dropdown */}
        <select
          value={conversation.status}
          onChange={(e) => onUpdateStatus(e.target.value as any)}
          className="px-2.5 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs font-medium text-text-secondary focus:outline-hidden focus:border-brand-500 cursor-pointer"
        >
          <option value="open">🟢 Open</option>
          <option value="pending">🟡 Pending</option>
          <option value="closed">⚪ Closed</option>
        </select>

        {/* Assigned Agent Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-subtle rounded-xl border border-border-default text-xs text-text-secondary">
          <UserCheck className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{conversation.agent?.name || 'Unassigned'}</span>
        </div>
      </div>
    </div>
  );
};

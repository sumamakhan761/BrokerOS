// ============================================================================
// BrokerOS — SMS Conversation List Component
// ============================================================================

import React, { useState } from 'react';
import { Search, MessageSquare, Plus, Phone } from 'lucide-react';
import type { SmsConversation } from '../../types/inbox';
import { StartNewSmsModal } from './StartNewSmsModal';
import { SMS_PROVIDERS } from '@brokeros/constants';

interface SmsConversationListProps {
  conversations: SmsConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (conv: SmsConversation) => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'open' | 'pending' | 'closed';
  onStatusFilterChange: (val: 'all' | 'open' | 'pending' | 'closed') => void;
  loading?: boolean;
}

export const SmsConversationList: React.FC<SmsConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  loading = false,
}) => {
  const [isNewSmsOpen, setIsNewSmsOpen] = useState(false);

  const formatLastMessageTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      return isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full md:w-80 lg:w-96 shrink-0">
      {/* Search & New SMS Header */}
      <div className="p-3.5 border-b border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search phone, name, copy..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsNewSmsOpen(true)}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0 font-bold"
            title="Start New SMS Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'open', 'pending', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusFilterChange(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold capitalize transition-colors shrink-0 ${
                statusFilter === filter
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading SMS conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-900 font-bold">No SMS threads found</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                Inbound replies to SMS broadcasts or newly started conversations will appear here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewSmsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New SMS</span>
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const contactDisplayName =
              conv.contactName ||
              (conv.lead ? `${conv.lead.firstName || ''} ${conv.lead.lastName || ''}`.trim() : null) ||
              conv.contactPhone;

            const provMeta =
              (SMS_PROVIDERS as Record<string, any>)[conv.assignedProvider] || SMS_PROVIDERS.TWILIO;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-amber-50/70 border-l-4 border-amber-500'
                    : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Contact Phone Avatar */}
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-200">
                  <Phone className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {contactDisplayName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatLastMessageTime(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 mb-1 truncate">
                    {conv.contactPhone}
                  </div>

                  <p className="text-xs text-slate-600 truncate line-clamp-1 mb-1.5">
                    {conv.lastMessageText || 'Conversation started'}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Provider Route Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: provMeta.color }}
                      />
                      <span>{provMeta.name}</span>
                    </span>

                    {/* Assigned Agent */}
                    {conv.agent && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold">
                        {conv.agent.name.split(' ')[0]}
                      </span>
                    )}

                    {/* Unread Pill */}
                    {conv.unreadCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <StartNewSmsModal
        isOpen={isNewSmsOpen}
        onClose={() => setIsNewSmsOpen(false)}
        onConversationStarted={(conv) => onSelectConversation(conv)}
      />
    </div>
  );
};

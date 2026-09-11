// ============================================================================
// BrokerOS — 2-Way Live SMS Team Inbox Master View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSmsConversations } from '../../hooks/use-sms-conversations';
import { useSmsMessages } from '../../hooks/use-sms-messages';
import { SmsConversationList } from './SmsConversationList';
import { SmsConversationHeader } from './SmsConversationHeader';
import { SmsConversationThread } from './SmsConversationThread';
import { SmsMessageComposer } from './SmsMessageComposer';
import { SmsContactDrawer } from './SmsContactDrawer';
import type { SmsConversation } from '../../types/inbox';
import { MessageSquare, Phone } from 'lucide-react';

export function SmsInboxView() {
  const {
    conversations,
    loading: conversationsLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    updateStatus,
    toggleAiAutoReply,
    markAsRead,
  } = useSmsConversations();

  const [activeConversation, setActiveConversation] = useState<SmsConversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Auto-select first conversation if none selected and available
  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  // Load messages for active conversation
  const {
    messages,
    loading: messagesLoading,
    sending,
    draftingAi,
    sendMessage,
    draftReplyWithAi,
  } = useSmsMessages(activeConversation?.id || null);

  const handleSelectConversation = (conv: SmsConversation) => {
    setActiveConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.id);
    }
  };

  const handleToggleAi = () => {
    if (!activeConversation) return;
    const nextState = !activeConversation.aiAutoReplyDisabled;
    toggleAiAutoReply(activeConversation.id, nextState);
    setActiveConversation({
      ...activeConversation,
      aiAutoReplyDisabled: nextState,
    });
  };

  const handleStatusChange = (newStatus: 'open' | 'pending' | 'closed') => {
    if (!activeConversation) return;
    updateStatus(activeConversation.id, newStatus);
    setActiveConversation({
      ...activeConversation,
      status: newStatus,
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[550px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-enter">
      {/* ── PANE 1: Conversation List (Left) ── */}
      <SmsConversationList
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onSelectConversation={handleSelectConversation}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={conversationsLoading}
      />

      {/* ── PANE 2: Active Chat Thread (Center) ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        {activeConversation ? (
          <>
            <SmsConversationHeader
              conversation={activeConversation}
              onUpdateStatus={handleStatusChange}
              onToggleAi={handleToggleAi}
              isDrawerOpen={isDrawerOpen}
              onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            />

            <SmsConversationThread
              messages={messages}
              loading={messagesLoading}
            />

            <SmsMessageComposer
              onSendMessage={sendMessage}
              onDraftAi={draftReplyWithAi}
              sending={sending}
              draftingAi={draftingAi}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">No Conversation Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select an SMS thread from the list or start a new conversation to communicate with leads.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── PANE 3: Contact & CRM Drawer (Right) ── */}
      {isDrawerOpen && activeConversation && (
        <SmsContactDrawer
          conversation={activeConversation}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}

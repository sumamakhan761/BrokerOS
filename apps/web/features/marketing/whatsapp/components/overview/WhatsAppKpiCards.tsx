'use client';

import React from 'react';
import { MessageSquare, Send, Sparkles, TrendingUp } from 'lucide-react';

interface WhatsAppKpiCardsProps {
  data: {
    activeConversations?: number;
    totalUnread?: number;
    totalBroadcasts?: number;
    totalContacts?: number;
    aiActive?: boolean;
    aiProvider?: string | null;
    reliability?: number;
    funnel?: { totalFailed?: number };
  } | null;
}

export const WhatsAppKpiCards: React.FC<WhatsAppKpiCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-xs font-medium">Active Conversations</span>
          <MessageSquare className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {data?.activeConversations ?? 0}
        </div>
        <p className="text-[11px] text-text-tertiary">
          {(data?.totalUnread ?? 0) > 0 ? (
            <span className="text-emerald-500 font-semibold">
              {data?.totalUnread} unread messages
            </span>
          ) : (
            'All customer queries caught up'
          )}
        </p>
      </div>

      <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-xs font-medium">Broadcast Campaigns</span>
          <Send className="w-4 h-4 text-brand-500" />
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {data?.totalBroadcasts ?? 0}
        </div>
        <p className="text-[11px] text-text-tertiary">
          {data?.totalContacts
            ? `${data.totalContacts} contacts reachable`
            : 'Meta Cloud API delivery'}
        </p>
      </div>

      <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-xs font-medium">AI Concierge</span>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {data?.aiActive ? 'Active' : 'Disabled'}
        </div>
        <p className="text-[11px] text-text-tertiary">
          {data?.aiActive
            ? `${(data?.aiProvider || 'LLM').toUpperCase()} auto-reply ready`
            : 'Enable in WhatsApp Settings'}
        </p>
      </div>

      <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-xs font-medium">Delivery Reliability</span>
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-500">
          {data ? `${data.reliability}%` : '100%'}
        </div>
        <p className="text-[11px] text-text-tertiary">
          {data?.funnel?.totalFailed
            ? `${data.funnel.totalFailed} failed dispatches`
            : 'Zero delivery errors'}
        </p>
      </div>
    </div>
  );
};

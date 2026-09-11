// ============================================================================
// BrokerOS — SMS Conversations Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { SmsConversation } from '../types/inbox';

export function useSmsConversations() {
  const [conversations, setConversations] = useState<SmsConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load SMS conversations');
      const data = await res.json();
      setConversations(data.items || []);
    } catch (err) {
      console.error('loadSmsConversations error:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, statusFilter, search]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleLiveConversationUpdate = useCallback((updated: SmsConversation) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updated };
        return next.sort((a, b) => {
          const tA = new Date(a.lastMessageAt || a.updatedAt).getTime();
          const tB = new Date(b.lastMessageAt || b.updatedAt).getTime();
          return tB - tA;
        });
      }
      return [updated, ...prev];
    });
  }, []);

  const updateStatus = async (conversationId: string, status: 'open' | 'pending' | 'closed') => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        handleLiveConversationUpdate(updated);
      }
    } catch (err) {
      console.error('updateSmsStatus error:', err);
    }
  };

  const assignAgent = async (conversationId: string, agentUserId: string | null) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations/${conversationId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agentUserId }),
      });
      if (res.ok) {
        const updated = await res.json();
        handleLiveConversationUpdate(updated);
      }
    } catch (err) {
      console.error('assignSmsAgent error:', err);
    }
  };

  const toggleAiAutoReply = async (conversationId: string, disabled: boolean) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations/${conversationId}/ai-toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ disabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        handleLiveConversationUpdate(updated);
      }
    } catch (err) {
      console.error('toggleAiAutoReply error:', err);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err) {
      console.error('markSmsAsRead error:', err);
    }
  };

  return {
    conversations,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    reload: loadConversations,
    handleLiveConversationUpdate,
    updateStatus,
    assignAgent,
    toggleAiAutoReply,
    markAsRead,
  };
}

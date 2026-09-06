// ============================================================================
// BrokerOS — WhatsApp Quick Replies Picker Modal
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Search, X, Zap, Plus, Trash2 } from 'lucide-react';
import type { WhatsAppQuickReply } from '../../types';

interface QuickReplyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  accountId?: string;
}

export const QuickReplyPickerModal: React.FC<QuickReplyPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  accountId,
}) => {
  const [replies, setReplies] = useState<WhatsAppQuickReply[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newShortcut, setNewShortcut] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!isOpen) return;

    async function fetchReplies() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (accountId) query.set('accountId', accountId);

        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setReplies(data || []);
        }
      } catch (err) {
        console.error('Failed to load quick replies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReplies();
  }, [isOpen, accountId, baseUrl]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newShortcut.trim() || !newContent.trim()) return;

    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          shortcut: newShortcut.startsWith('/') ? newShortcut : `/${newShortcut}`,
          content: newContent,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setReplies((prev) => [created, ...prev]);
        setNewShortcut('');
        setNewContent('');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error creating quick reply:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReplies((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting quick reply:', err);
    }
  };

  const filtered = replies.filter(
    (r) =>
      r.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-text-primary text-base">Quick Replies</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search shortcuts (e.g. /pricing)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-medium text-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {isCreating && (
            <div className="p-3.5 bg-bg-base rounded-xl border border-border-default space-y-2.5">
              <input
                type="text"
                placeholder="Shortcut (e.g. /sitevisit)"
                value={newShortcut}
                onChange={(e) => setNewShortcut(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
              />
              <textarea
                placeholder="Canned response text..."
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 text-xs text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-medium"
                >
                  Save Shortcut
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-xs text-text-tertiary">Loading canned responses...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-tertiary">
              No quick replies found. Type a shortcut or click New to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.content);
                    onClose();
                  }}
                  className="group p-3 border border-border-default rounded-xl hover:border-brand-500 hover:bg-brand-50/20 cursor-pointer transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="font-mono text-xs font-semibold text-brand-600">{item.shortcut}</span>
                    <p className="text-xs text-text-secondary line-clamp-2">{item.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete shortcut"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BrokerOS — WhatsApp Quick Replies Manager Settings
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import type { WhatsAppQuickReply } from '../../types';

interface QuickRepliesManagerProps {
  accountId?: string;
}

export const QuickRepliesManager: React.FC<QuickRepliesManagerProps> = ({
  accountId,
}) => {
  const [items, setItems] = useState<WhatsAppQuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<WhatsAppQuickReply | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [shortcut, setShortcut] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (accountId) q.set('accountId', accountId);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      } else {
        setError('Failed to load quick replies');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching quick replies');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, accountId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShortcut('/');
    setContent('');
    setIsCreating(true);
    setError(null);
  };

  const handleOpenEdit = (item: WhatsAppQuickReply) => {
    setEditingItem(item);
    setShortcut(item.shortcut);
    setContent(item.content);
    setIsCreating(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcut.trim() || !content.trim()) {
      setError('Please provide both shortcut and message text.');
      return;
    }

    const formattedShortcut = shortcut.startsWith('/') ? shortcut.trim() : `/${shortcut.trim()}`;

    try {
      setSaving(true);
      setError(null);

      if (editingItem) {
        // Update
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortcut: formattedShortcut,
            content: content.trim(),
          }),
        });
        if (!res.ok) throw new Error('Failed to update quick reply');
      } else {
        // Create
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId,
            shortcut: formattedShortcut,
            content: content.trim(),
          }),
        });
        if (!res.ok) throw new Error('Failed to create quick reply');
      }

      setIsCreating(false);
      setEditingItem(null);
      setShortcut('');
      setContent('');
      await loadItems();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this canned response shortcut?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error('Error deleting quick reply:', err);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-text-primary text-base">Quick Replies</h3>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            Pre-defined canned responses agents can insert in the live inbox by typing <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-text-primary">/shortcut</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quick Reply</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter shortcuts (e.g. /pricing, /sitevisit)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
        />
      </div>

      {/* List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-tertiary">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs">Loading canned responses...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border-default rounded-2xl">
          <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-text-secondary font-medium">No quick replies found</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            Click "New Quick Reply" above to create shortcuts for frequent client queries.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-default/60 border border-border-default rounded-xl overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-bg-base/40 hover:bg-bg-subtle/50 transition-colors flex items-start justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold">
                    {item.shortcut}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-muted transition-colors"
                  title="Edit quick reply"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-text-tertiary hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete quick reply"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create/Edit */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <h4 className="font-semibold text-text-primary text-sm">
                {editingItem ? 'Edit Quick Reply' : 'Create Quick Reply'}
              </h4>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Shortcut (Must begin with /)
                </label>
                <input
                  type="text"
                  placeholder="/pricing"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs font-mono text-text-primary focus:outline-hidden focus:border-brand-500"
                  required
                />
                <p className="text-[11px] text-text-tertiary mt-1">
                  Agents type this in chat to trigger auto-complete. Example: <code>/sitevisit</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Canned Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Hi! Our project site visit is available everyday from 10 AM to 6 PM. May I book a slot for you this Saturday?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingItem ? 'Update Shortcut' : 'Create Shortcut'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

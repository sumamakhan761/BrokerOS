// ============================================================================
// BrokerOS — Email Quick Replies Picker & Manager Modal (Client-side & Offline-first)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Search, X, Zap, Plus, Trash2, RotateCcw } from 'lucide-react';
import { EmailQuickReplyItem, DEFAULT_EMAIL_QUICK_REPLIES } from '../../types/inbox';

const STORAGE_KEY = 'brokeros_email_quick_replies';

interface EmailQuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export const EmailQuickReplyModal: React.FC<EmailQuickReplyModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [replies, setReplies] = useState<EmailQuickReplyItem[]>(DEFAULT_EMAIL_QUICK_REPLIES);
  const [search, setSearch] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load from localStorage or seed with defaults
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReplies(parsed);
            return;
          }
        }
      } catch {
        // use defaults
      }
    }
    setReplies(DEFAULT_EMAIL_QUICK_REPLIES);
  }, [isOpen]);

  if (!isOpen) return null;

  const persistReplies = (updated: EmailQuickReplyItem[]) => {
    setReplies(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('brokeros_email_quick_replies_changed'));
      } catch (e) {
        console.warn('Failed to persist quick reply to localStorage', e);
      }
    }
  };

  const handleCreate = () => {
    if (!newShortcut.trim() || !newContent.trim()) return;

    const formattedShortcut = newShortcut.trim().startsWith('/')
      ? newShortcut.trim()
      : `/${newShortcut.trim()}`;

    const newReply: EmailQuickReplyItem = {
      id: `custom-${Date.now()}`,
      shortcut: formattedShortcut,
      title: newTitle.trim() || formattedShortcut,
      contentHtml: newContent.trim(),
    };

    persistReplies([newReply, ...replies]);
    setNewShortcut('');
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = replies.filter((r) => r.id !== id);
    persistReplies(updated);
  };

  const handleResetDefaults = () => {
    persistReplies(DEFAULT_EMAIL_QUICK_REPLIES);
  };

  const filtered = replies.filter(
    (r) =>
      r.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.contentHtml.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Quick Replies</h3>
              <p className="text-xs text-text-tertiary">Type / in composer to auto-complete canned responses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar & Search */}
        <div className="p-4 border-b border-border-default flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shortcut, title, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
            />
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Cancel' : 'New Reply'}</span>
          </button>
          <button
            onClick={handleResetDefaults}
            title="Reset to default templates"
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-xl border border-border-default hover:bg-bg-subtle transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline Creator */}
        {isCreating && (
          <div className="p-4 bg-bg-base border-b border-border-default space-y-2.5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Shortcut (e.g. /pricing)"
                value={newShortcut}
                onChange={(e) => setNewShortcut(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary font-mono text-amber-600"
              />
              <input
                type="text"
                placeholder="Title (e.g. Pricing Details)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Response content..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-text-secondary hover:text-text-primary rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newShortcut.trim() || !newContent.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                Save Quick Reply
              </button>
            </div>
          </div>
        )}

        {/* List of Replies */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-tertiary">No quick replies found</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.contentHtml);
                  onClose();
                }}
                className="p-3 bg-bg-base hover:bg-bg-subtle border border-border-default hover:border-brand-500/50 rounded-xl cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {item.shortcut}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to insert ↵
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-1 text-text-tertiary hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete quick reply"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{item.contentHtml}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BrokerOS — Email Quick Replies Picker & Manager Modal
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Search, X, Zap, Plus, Trash2, Loader2 } from 'lucide-react';
import type { EmailQuickReplyItem } from '../../types/inbox';

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
  const [replies, setReplies] = useState<EmailQuickReplyItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newShortcut, setNewShortcut] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Built-in default quick replies if database table is empty
  const defaultReplies: EmailQuickReplyItem[] = [
    {
      id: 'qr-1',
      shortcut: '/site-visit',
      title: 'Site Visit Confirmation',
      contentHtml: 'We would be delighted to host you for a private site inspection this weekend. Our luxury concierge will meet you at the reception. What time works best for you?',
    },
    {
      id: 'qr-2',
      shortcut: '/pricing',
      title: 'Payment Plan & Pricing',
      contentHtml: 'Attached please find the comprehensive payment milestone schedule and current inventory availability with flexible 20/80 developer payment options.',
    },
    {
      id: 'qr-3',
      shortcut: '/brochure',
      title: 'Project Brochure Download',
      contentHtml: 'Here is the high-resolution architectural brochure including full floor plans, penthouse specs, and world-class amenities overview.',
    },
    {
      id: 'qr-4',
      shortcut: '/followup',
      title: 'Gentle Follow-up',
      contentHtml: 'Following up on our recent conversation regarding the residences. Have you had a chance to review the floor layout options?',
    },
  ];

  useEffect(() => {
    if (!isOpen) return;

    async function fetchReplies() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/email/settings/quick-replies`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReplies(data);
          } else {
            setReplies(defaultReplies);
          }
        } else {
          setReplies(defaultReplies);
        }
      } catch (err) {
        setReplies(defaultReplies);
      } finally {
        setLoading(false);
      }
    }

    fetchReplies();
  }, [isOpen, baseUrl]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newShortcut.trim() || !newContent.trim()) return;

    const formattedShortcut = newShortcut.startsWith('/') ? newShortcut : `/${newShortcut}`;
    const newReply: EmailQuickReplyItem = {
      id: `custom-${Date.now()}`,
      shortcut: formattedShortcut,
      title: newTitle.trim() || formattedShortcut,
      contentHtml: newContent.trim(),
    };

    setReplies((prev) => [newReply, ...prev]);
    setNewShortcut('');
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);

    // Save to backend if endpoint available
    fetch(`${baseUrl}/api/marketing/email/settings/quick-replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newReply),
    }).catch(() => null);
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
              placeholder="Search shortcut or content..."
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
            <div className="flex justify-end">
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
                  <span className="text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to insert ↵
                  </span>
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

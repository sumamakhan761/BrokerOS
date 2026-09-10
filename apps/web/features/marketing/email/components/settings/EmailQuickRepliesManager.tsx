// ============================================================================
// BrokerOS — Email Quick Replies Manager Settings
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
  Mail,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { EmailQuickReply } from '@/features/marketing/types';

export const EmailQuickRepliesManager: React.FC = () => {
  const [items, setItems] = useState<EmailQuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<EmailQuickReply | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [shortcut, setShortcut] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [category, setCategory] = useState('General');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/quick-replies`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      } else {
        toast.error('Failed to load quick replies');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching quick replies');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setShortcut('/');
    setTitle('');
    setSubject('');
    setContentHtml('');
    setCategory('General');
    setIsCreating(true);
  };

  const openEditModal = (item: EmailQuickReply) => {
    setEditingItem(item);
    setShortcut(item.shortcut);
    setTitle(item.title);
    setSubject(item.subject || '');
    setContentHtml(item.contentHtml);
    setCategory(item.category || 'General');
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShortcut = shortcut.startsWith('/') ? shortcut : `/${shortcut}`;

    if (!cleanShortcut.trim() || cleanShortcut === '/') {
      toast.error('Shortcut must have a name, e.g. /pricing');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!contentHtml.trim()) {
      toast.error('Email reply content is required');
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        // Update
        const res = await fetch(`${baseUrl}/api/marketing/email/quick-replies/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            shortcut: cleanShortcut,
            title,
            subject: subject.trim() || undefined,
            contentHtml,
            category,
          }),
        });
        if (!res.ok) throw new Error('Failed to update quick reply');
        toast.success('Quick reply updated');
      } else {
        // Create
        const res = await fetch(`${baseUrl}/api/marketing/email/quick-replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            shortcut: cleanShortcut,
            title,
            subject: subject.trim() || undefined,
            contentHtml,
            category,
          }),
        });
        if (!res.ok) throw new Error('Failed to create quick reply');
        toast.success('Quick reply created');
      }
      closeModal();
      loadItems();
    } catch (err: any) {
      toast.error(err.message || 'Error saving quick reply');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this canned shortcut?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/email/quick-replies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete shortcut');
      toast.success('Quick reply deleted');
      loadItems();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting shortcut');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.contentHtml.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Email Canned Quick Replies</h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Standardize executive responses. Type <code className="px-1 py-0.5 bg-bg-subtle rounded text-amber-600 font-mono text-[11px]">/</code> followed by shortcut name in inbox or flow editor to instantly insert curated templates.
              </p>
            </div>
          </div>
          <Button onClick={openCreateModal} className="gap-2 font-semibold shadow-xs shrink-0">
            <Plus className="w-4 h-4" />
            <span>New Shortcut</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shortcuts by title, keyword, or snippet..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-bg-surface border border-border-default rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
          <p className="text-xs text-text-tertiary">Loading canned replies...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-bg-surface border border-dashed border-border-default rounded-2xl">
          <Zap className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-40" />
          <h4 className="text-sm font-semibold text-text-primary">No quick replies found</h4>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            Create standard responses for pricing inquiries, site visit booking, or project brochures to accelerate sales response times.
          </p>
          <Button onClick={openCreateModal} variant="outline" size="sm" className="mt-4 gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Shortcut</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-bg-surface border border-border-default rounded-2xl p-5 shadow-2xs hover:border-border-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                      {item.shortcut}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                  </div>
                  {item.category && (
                    <span className="text-[10px] font-medium text-text-tertiary bg-bg-subtle px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>

                {item.subject && (
                  <div className="text-[11px] text-text-secondary mb-2 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-text-tertiary shrink-0" />
                    <span className="font-medium text-text-primary">Subject:</span>
                    <span className="truncate">{item.subject}</span>
                  </div>
                )}

                <p className="text-xs text-text-secondary line-clamp-3 bg-bg-subtle/50 p-2.5 rounded-xl border border-border-subtle font-sans leading-relaxed">
                  {item.contentHtml.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border-subtle">
                <span className="text-[11px] text-text-tertiary">
                  Used {item.useCount} times
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => openEditModal(item)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-text-tertiary hover:text-text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-bg-surface border border-border-default rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">
                {editingItem ? 'Edit Quick Reply' : 'Create Quick Reply'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Shortcut Name
                  </label>
                  <Input
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    placeholder="/pricing"
                    className="text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Pricing, Site Visit"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Title / Label
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Send 3 BHK Price Breakdown & Brochure"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Email Subject Line (Optional)
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Re: Your requested floor plans & cost sheet"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Email Content (Markdown or HTML)
                </label>
                <textarea
                  rows={6}
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="Hi {{lead_name}},&#10;&#10;Thank you for reaching out! Attached is the detailed pricing schedule..."
                  className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} size="sm" className="gap-1.5 font-semibold">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Update Shortcut' : 'Create Shortcut'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

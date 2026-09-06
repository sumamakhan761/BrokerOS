// ============================================================================
// BrokerOS — WhatsApp Contact Tags Manager Settings
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Users,
} from 'lucide-react';
import type { WhatsAppTag } from '../../types';

const PRESET_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Pink', value: '#ec4899' },
];

interface TagsManagerProps {
  accountId?: string;
}

export const TagsManager: React.FC<TagsManagerProps> = ({ accountId }) => {
  const [tags, setTags] = useState<WhatsAppTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (accountId) q.set('accountId', accountId);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/tags?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTags(data || []);
      } else {
        setError('Failed to fetch contact tags');
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading tags');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, accountId]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          name: newTagName.trim(),
          color: selectedColor,
        }),
      });

      if (!res.ok) throw new Error('Failed to create tag');

      setNewTagName('');
      await loadTags();
    } catch (err: any) {
      setError(err?.message || 'Failed to create tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tag? It will be detached from all contacts.')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/tags/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete tag:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <TagIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-text-primary text-base">Contact Tags</h3>
        </div>
        <p className="text-xs text-text-tertiary mt-1">
          Color-coded labels used to segment contacts for broadcast targeting and pipeline filtering.
        </p>
      </div>

      {/* Inline Create Form */}
      <form
        onSubmit={handleCreate}
        className="p-4 bg-bg-base/60 border border-border-default rounded-xl space-y-3"
      >
        <div className="text-xs font-semibold text-text-secondary">Add New Tag</div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="e.g. VIP Investor, Pre-Sales, Cold Followup"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
          />

          {/* Color palette picker */}
          <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-default rounded-xl">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-6 h-6 rounded-lg transition-transform ${
                  selectedColor === c.value
                    ? 'scale-110 ring-2 ring-brand-500 ring-offset-2 ring-offset-bg-surface shadow-xs'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                title={c.name}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || !newTagName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add Tag</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Tags Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-text-tertiary">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs">Loading contact tags...</span>
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-default rounded-xl">
          <p className="text-xs text-text-secondary">No custom tags created yet</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">Use the form above to add your first contact tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="p-3 bg-bg-base/40 border border-border-default rounded-xl flex items-center justify-between group hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                />
                <span className="font-medium text-xs text-text-primary truncate">
                  {tag.name}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-bg-subtle text-[10px] text-text-tertiary shrink-0">
                  <Users className="w-2.5 h-2.5" />
                  <span>{tag._count?.contacts ?? 0}</span>
                </span>
              </div>

              <button
                type="button"
                disabled={deletingId === tag.id}
                onClick={() => handleDelete(tag.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete tag"
              >
                {deletingId === tag.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

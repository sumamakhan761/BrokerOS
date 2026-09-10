// ============================================================================
// BrokerOS — Email Contact & Lead Tags Manager Settings
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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { EmailTag } from '@/features/marketing/types';

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

export const EmailTagsManager: React.FC = () => {
  const [tags, setTags] = useState<EmailTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/tags`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data || []);
      } else {
        toast.error('Failed to fetch contact tags');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error loading tags');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newTagName.trim(),
          color: selectedColor,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create tag');
      }

      toast.success('Tag created successfully');
      setNewTagName('');
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Error creating tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/email/tags/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete tag');
      toast.success('Tag removed');
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting tag');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <TagIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Email Audience & Lead Tags</h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Segment prospect intent automatically. Flows apply tags (e.g. <span className="font-mono text-violet-600">SITE_VISIT_REQ</span>, <span className="font-mono text-emerald-600">HOT_PROSPECT</span>) when inbound replies match intent keywords.
            </p>
          </div>
        </div>
      </div>

      {/* Tag Creation Form */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
          Create New Lead Tag
        </h4>
        <form onSubmit={handleCreateTag} className="flex flex-col md:flex-row items-end gap-3">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-text-secondary">Tag Label</label>
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g. SITE_VISIT_SCHEDULED, PRICE_INQUIRY"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5 w-full md:w-auto">
            <label className="block text-xs font-semibold text-text-secondary">Color Theme</label>
            <div className="flex items-center gap-2 p-1.5 bg-bg-subtle border border-border-default rounded-xl">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {selectedColor === c.value && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving || !newTagName.trim()} className="gap-2 font-semibold text-xs shadow-xs shrink-0">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add Tag</span>
          </Button>
        </form>
      </div>

      {/* Tags Grid */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Existing Tags ({tags.length})
          </h4>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs text-text-tertiary">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary">
            No custom tags configured yet. Create a tag above to tag prospects automatically in Flows.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-default bg-bg-surface hover:border-border-hover transition-all group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs font-semibold text-text-primary">{tag.name}</span>
                <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5" />
                  {tag._count?.recipients ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={deletingId === tag.id}
                  className="text-text-tertiary hover:text-red-500 transition-colors ml-1 p-0.5"
                >
                  {deletingId === tag.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

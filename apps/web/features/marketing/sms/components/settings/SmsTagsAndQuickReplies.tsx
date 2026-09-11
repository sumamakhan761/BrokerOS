// ============================================================================
// BrokerOS — SMS Tags & Quick Replies Settings Manager
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Loader2,
  Check,
  MessageSquare,
  Copy,
  Hash,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { DEFAULT_SMS_QUICK_REPLIES } from "@brokeros/constants";

export interface SmsTagItem {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const PRESET_COLORS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Indigo", value: "#6366f1" },
];

export const SmsTagsAndQuickReplies: React.FC = () => {
  const [tags, setTags] = useState<SmsTagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/tags`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data || []);
      }
    } catch {
      toast.error("Failed to load SMS tags");
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
      const res = await fetch(`${baseUrl}/api/marketing/sms/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newTagName.trim(),
          color: selectedColor,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create tag");
      }

      toast.success("SMS Tag created");
      setNewTagName("");
      loadTags();
    } catch (err: any) {
      toast.error(err.message || "Error creating tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SMS tag?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/sms/tags/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete tag");
      toast.success("Tag removed");
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Quick reply text copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. SMS CONVERSATION & LEAD TAGS ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              SMS Conversation & Lead Tags
            </h3>
          </div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Classify prospect intent and segment inquiries inside the Live Inbox and 2-Way Flow branches.
          </p>
        </div>

        {/* Create Tag Form */}
        <form onSubmit={handleCreateTag} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="e.g. VIP Buyer, Price Sensitive, Site Visit Requested"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                    selectedColor === c.value ? "scale-125 ring-2 ring-offset-2 ring-purple-600" : "hover:scale-110"
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.value && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={saving || !newTagName.trim()}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl w-full sm:w-auto"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Tag</span>
            </Button>
          </div>
        </form>

        {/* Tags List */}
        {loading ? (
          <div className="py-6 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
          </div>
        ) : tags.length === 0 ? (
          <div className="p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
            <TagIcon className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">No custom tags created yet</p>
            <p className="text-[11px] text-slate-500">Create tags above to categorize incoming lead messages.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}35`,
                  color: tag.color,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={deletingId === tag.id}
                  className="hover:opacity-75 transition-opacity ml-1 p-0.5 text-slate-500 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. CANNED QUICK REPLIES DIRECTORY ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Canned SMS Quick Replies
              </h3>
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
              Pre-approved, single-segment responses available in the Live Inbox composer for instant 1-click dispatch.
            </p>
          </div>
          <Badge variant="brand" className="text-[10px]">
            {DEFAULT_SMS_QUICK_REPLIES.length} Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {DEFAULT_SMS_QUICK_REPLIES.map((reply) => {
            const isCopied = copiedId === reply.shortcut;
            const charCount = reply.text.length;

            return (
              <div
                key={reply.shortcut}
                className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{reply.title}</span>
                    <Badge variant="default" className="text-[9px] uppercase tracking-wider font-mono">
                      {reply.shortcut}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60 font-mono text-[11px]">
                    "{reply.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-purple-700">
                    <Hash className="w-3 h-3" /> {charCount} Chars • 1 Segment
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySnippet(reply.shortcut, reply.text)}
                    className="h-7 px-2 text-[11px] font-bold gap-1 text-slate-600 hover:text-purple-600 rounded-lg"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

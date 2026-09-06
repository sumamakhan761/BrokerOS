// ============================================================================
// BrokerOS — WhatsApp Message Composer Bar
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Zap,
  FileText,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { TemplatePickerModal } from './TemplatePickerModal';
import { QuickReplyPickerModal } from './QuickReplyPickerModal';
import type { WhatsAppTemplate } from '../../types';

interface MessageComposerProps {
  onSendMessage: (payload: {
    type?: 'text' | 'media' | 'template' | 'interactive';
    text?: string;
    mediaUrl?: string;
    mediaKind?: 'image' | 'video' | 'document' | 'audio';
    caption?: string;
    templateName?: string;
    templateLanguage?: string;
    templateParams?: string[];
  }) => Promise<any>;
  onDraftWithAi: () => Promise<string>;
  accountId?: string;
  disabled?: boolean;
  is24HourWindowActive?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onDraftWithAi,
  accountId,
  disabled = false,
  is24HourWindowActive = false,
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);

  // Slash command autocomplete state
  const [allQuickReplies, setAllQuickReplies] = useState<Array<{ id: string; shortcut: string; content: string }>>([]);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Fetch quick replies for slash completion
  useEffect(() => {
    async function loadQuickReplies() {
      try {
        const query = new URLSearchParams();
        if (accountId) query.set('accountId', accountId);
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/quick-replies?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAllQuickReplies(data || []);
        }
      } catch (err) {
        // silent fail
      }
    }
    loadQuickReplies();
  }, [accountId, baseUrl]);

  // Check if text triggers slash autocomplete
  useEffect(() => {
    const match = text.match(/(^|\s)\/([a-zA-Z0-9_-]*)$/);
    if (match) {
      setSlashQuery(match[2].toLowerCase());
      setSlashSelectedIndex(0);
    } else {
      setSlashQuery(null);
    }
  }, [text]);

  const matchingQuickReplies = slashQuery !== null
    ? allQuickReplies.filter(
      (r) =>
        r.shortcut.toLowerCase().includes(`/${slashQuery}`) ||
        r.shortcut.toLowerCase().replace('/', '').includes(slashQuery) ||
        r.content.toLowerCase().includes(slashQuery),
    )
    : [];

  const insertQuickReply = (content: string) => {
    // Replace the trailing /query with content
    const updated = text.replace(/(^|\s)\/([a-zA-Z0-9_-]*)$/, `$1${content} `);
    setText(updated);
    setSlashQuery(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;

    try {
      setSending(true);
      await onSendMessage({ type: 'text', text: text.trim() });
      setText('');
      setSlashQuery(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send text message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashQuery !== null && matchingQuickReplies.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % matchingQuickReplies.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + matchingQuickReplies.length) % matchingQuickReplies.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = matchingQuickReplies[slashSelectedIndex];
        if (selected) {
          insertQuickReply(selected.content);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAiDraft = async () => {
    if (aiDrafting || disabled) return;
    try {
      setAiDrafting(true);
      const draft = await onDraftWithAi();
      if (draft) {
        setText(draft);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (err) {
      console.error('AI draft generation failed:', err);
    } finally {
      setAiDrafting(false);
    }
  };

  const handleSelectTemplate = async (tmpl: WhatsAppTemplate, params: string[]) => {
    try {
      setSending(true);
      await onSendMessage({
        type: 'template',
        templateName: tmpl.name,
        templateLanguage: tmpl.language,
        templateParams: params,
      });
    } catch (err) {
      console.error('Failed to send template message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectQuickReply = (content: string) => {
    setText((prev) => (prev ? `${prev} ${content}` : content));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Direct upload to Vercel Blob or local storage
    try {
      setSending(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Media upload failed');
      const data = await res.json();

      let mediaKind: 'image' | 'video' | 'document' | 'audio' = 'document';
      if (file.type.startsWith('image/')) mediaKind = 'image';
      else if (file.type.startsWith('video/')) mediaKind = 'video';
      else if (file.type.startsWith('audio/')) mediaKind = 'audio';

      await onSendMessage({
        type: 'media',
        mediaUrl: data.url,
        mediaKind,
        caption: text.trim() || file.name,
      });
      setText('');
    } catch (err) {
      console.error('Media send failed:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 bg-bg-surface border-t border-border-default">
      {/* 24-Hour Policy Alert when closed */}
      {!is24HourWindowActive && (
        <div className="flex items-center justify-between gap-2 mb-2.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate text-[11px]">
              Customer window closed: Meta requires an Approved Template until customer replies.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors shadow-2xs flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>Send Template</span>
          </button>
        </div>
      )}

      {/* Action Bar Above Input */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          {/* Quick Replies Button */}
          <button
            type="button"
            onClick={() => setIsQuickReplyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Insert quick canned response"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Replies</span>
          </button>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Send official HSM WhatsApp template"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>

          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Attach image, brochure, or document"
          >
            <Paperclip className="w-3.5 h-3.5 text-blue-500" />
            <span>Media</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </div>

        {/* AI Draft Assistant Button */}
        <button
          type="button"
          onClick={handleAiDraft}
          disabled={aiDrafting || disabled}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all shadow-2xs disabled:opacity-50"
        >
          {aiDrafting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{aiDrafting ? 'Drafting...' : 'Draft with AI'}</span>
        </button>
      </div>

      {/* Slash Command Autocomplete Popover */}
      {slashQuery !== null && matchingQuickReplies.length > 0 && (
        <div className="mb-2 p-1.5 bg-bg-surface border border-border-default rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase flex items-center justify-between">
            <span>Quick Replies (/{slashQuery})</span>
            <span>↑↓ to navigate · ↵ to insert · Esc to dismiss</span>
          </div>
          {matchingQuickReplies.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => insertQuickReply(item.content)}
              onMouseEnter={() => setSlashSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${idx === slashSelectedIndex
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                : 'text-text-primary hover:bg-bg-subtle'
                }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-amber-500 shrink-0">{item.shortcut}</span>
                <span className="truncate text-text-secondary">{item.content}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Textarea Input + Send Button */}
      <div className="flex items-end gap-2 bg-bg-base border border-border-default rounded-2xl p-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled || sending}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Select a conversation to start messaging...'
              : 'Type a message... (Type / for quick replies, Enter to send)'
          }
          className="flex-1 bg-transparent resize-none border-none outline-hidden px-3 py-2 text-sm text-text-primary placeholder:text-text-muted max-h-32 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors shrink-0 shadow-sm"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Modals */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        accountId={accountId}
      />

      <QuickReplyPickerModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        onSelect={handleSelectQuickReply}
        accountId={accountId}
      />
    </div>
  );
};

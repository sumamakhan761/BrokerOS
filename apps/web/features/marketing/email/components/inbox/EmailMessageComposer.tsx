// ============================================================================
// BrokerOS — Email Message Composer Bar
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Zap,
  FileText,
  Loader2,
  Server,
  X,
} from 'lucide-react';
import { EmailQuickReplyModal } from './EmailQuickReplyModal';
import { EmailTemplatePickerModal } from './EmailTemplatePickerModal';
import { EmailQuickReplyItem, DEFAULT_EMAIL_QUICK_REPLIES } from '../../types/inbox';

interface EmailMessageComposerProps {
  onSendMessage: (payload: {
    text?: string;
    html?: string;
    subject?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size?: number;
      contentType?: string;
    }>;
  }) => Promise<any>;
  onDraftWithAi: () => Promise<{ subject: string; textBody: string; htmlBody: string }>;
  assignedProvider?: string;
  assignedSenderEmail?: string | null;
  disabled?: boolean;
}

export const EmailMessageComposer: React.FC<EmailMessageComposerProps> = ({
  onSendMessage,
  onDraftWithAi,
  assignedProvider = 'SYSTEM_DEFAULT',
  assignedSenderEmail,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; size?: number }>>([]);

  // Slash command autocomplete state
  const [allQuickReplies, setAllQuickReplies] = useState<EmailQuickReplyItem[]>(DEFAULT_EMAIL_QUICK_REPLIES);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick replies for slash completion (synced with localStorage & default library)
  useEffect(() => {
    function loadQuickReplies() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('brokeros_email_quick_replies');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAllQuickReplies(parsed);
              return;
            }
          }
        } catch {
          // fallback
        }
      }
      setAllQuickReplies(DEFAULT_EMAIL_QUICK_REPLIES);
    }

    loadQuickReplies();
    if (typeof window !== 'undefined') {
      window.addEventListener('brokeros_email_quick_replies_changed', loadQuickReplies);
      return () => {
        window.removeEventListener('brokeros_email_quick_replies_changed', loadQuickReplies);
      };
    }
  }, []);

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
          r.contentHtml.toLowerCase().includes(slashQuery),
      )
    : [];

  const insertQuickReply = (content: string) => {
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
      await onSendMessage({
        text: text.trim(),
        subject: subject.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setText('');
      setSubject('');
      setShowSubjectInput(false);
      setAttachments([]);
      setSlashQuery(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send email reply:', err);
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
          insertQuickReply(selected.contentHtml);
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
      if (draft?.textBody) {
        setText(draft.textBody);
        if (draft.subject) {
          setSubject(draft.subject);
          setShowSubjectInput(true);
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setAttachments((prev) => [
      ...prev,
      {
        name: file.name,
        url: fileUrl,
        size: file.size,
      },
    ]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-3 bg-bg-surface border-t border-border-default">
      {/* Thread Continuity Identity Banner */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 text-[11px] text-text-tertiary">
        <div className="flex items-center gap-1.5 min-w-0">
          <Server className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">
            Sending from: <strong className="text-text-primary font-medium">{assignedSenderEmail || 'sales@brokeros.com'}</strong> via <span className="font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">{assignedProvider.replace('_', ' ')}</span>
          </span>
        </div>
        {!showSubjectInput && (
          <button
            type="button"
            onClick={() => setShowSubjectInput(true)}
            className="text-[10px] text-blue-600 hover:underline shrink-0 font-medium"
          >
            + Custom Subject
          </button>
        )}
      </div>

      {/* Optional Subject Line Override */}
      {showSubjectInput && (
        <div className="flex items-center gap-2 mb-2 px-1 animate-in slide-in-from-top-1">
          <input
            type="text"
            placeholder="Custom Subject Line (optional)..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 px-3 py-1 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => {
              setShowSubjectInput(false);
              setSubject('');
            }}
            className="p-1 text-text-tertiary hover:text-text-primary rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
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
            title="Insert canned response"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Replies</span>
          </button>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Insert real-estate email template"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>

          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Attach brochure or document"
          >
            <Paperclip className="w-3.5 h-3.5 text-blue-500" />
            <span>Attach</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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

      {/* Attachments Preview Pill List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-base border border-border-default rounded-lg text-xs text-text-secondary"
            >
              <Paperclip className="w-3 h-3 text-text-tertiary" />
              <span className="truncate max-w-xs">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                className="text-text-tertiary hover:text-rose-500 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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
              onClick={() => insertQuickReply(item.contentHtml)}
              onMouseEnter={() => setSlashSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                idx === slashSelectedIndex
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-text-primary hover:bg-bg-subtle'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-amber-500 font-bold shrink-0">{item.shortcut}</span>
                <span className="truncate text-text-secondary">{item.contentHtml}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Textarea Input + Send Button */}
      <div className="flex items-end gap-2 bg-bg-base border border-border-default rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          disabled={disabled || sending}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Select an email thread to reply...'
              : 'Write email reply... (Type / for quick replies, Enter to send)'
          }
          className="flex-1 bg-transparent resize-none border-none outline-hidden px-3 py-2 text-sm text-text-primary placeholder:text-text-muted max-h-40 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-sm"
          title="Send Email Reply (Enter)"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Modals */}
      <EmailQuickReplyModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        onSelect={(content) => {
          setText((prev) => (prev ? `${prev} ${content}` : content));
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      <EmailTemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(content, tmplSubject) => {
          setText((prev) => (prev ? `${prev}\n\n${content}` : content));
          if (tmplSubject) {
            setSubject(tmplSubject);
            setShowSubjectInput(true);
          }
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />
    </div>
  );
};

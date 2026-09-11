// ============================================================================
// BrokerOS — SMS Message Composer Component
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  Zap,
  Bookmark,
  Command,
} from 'lucide-react';
import { calculateSmsSegments, DEFAULT_SMS_QUICK_REPLIES } from '@brokeros/constants';
import { toast } from 'sonner';

interface SmsMessageComposerProps {
  onSendMessage: (payload: { text: string }) => Promise<any>;
  onDraftAi: () => Promise<{ text: string }>;
  sending?: boolean;
  draftingAi?: boolean;
  disabled?: boolean;
}

export const SmsMessageComposer: React.FC<SmsMessageComposerProps> = ({
  onSendMessage,
  onDraftAi,
  sending = false,
  draftingAi = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { segments, isUnicode, charCount, remainingInSegment } = calculateSmsSegments(text);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }

    // Trigger slash commands
    if (e.key === '/' && text.trim() === '') {
      setQuickRepliesOpen(true);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    try {
      await onSendMessage({ text: trimmed });
      setText('');
      setQuickRepliesOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send SMS reply');
    }
  };

  const handleApplyQuickReply = (qrText: string) => {
    setText(qrText);
    setQuickRepliesOpen(false);
    textareaRef.current?.focus();
  };

  const handleTriggerAiDraft = async () => {
    try {
      const draft = await onDraftAi();
      if (draft?.text) {
        setText(draft.text);
        toast.success('Groq AI generated draft reply');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI draft');
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200 space-y-2.5 relative">
      {/* Quick Replies Popup Menu */}
      {quickRepliesOpen && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-20 animate-enter max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            <span>Canned Quick Replies (/ shortcuts)</span>
            <button
              type="button"
              onClick={() => setQuickRepliesOpen(false)}
              className="text-slate-400 hover:text-slate-900"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            {DEFAULT_SMS_QUICK_REPLIES.map((qr) => (
              <button
                key={qr.shortcut}
                type="button"
                onClick={() => handleApplyQuickReply(qr.text)}
                className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-slate-900 group-hover:text-amber-700">
                    {qr.shortcut} — {qr.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-md">{qr.text}</div>
                </div>
                <span className="text-[10px] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Use &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder="Type an SMS reply... (Type '/' for quick replies, Ctrl+Enter to send)"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none font-medium"
        />
      </div>

      {/* Footer Controls & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Drafting Button */}
          <button
            type="button"
            onClick={handleTriggerAiDraft}
            disabled={draftingAi || disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-extrabold transition-all shadow-2xs"
          >
            {draftingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            )}
            <span>{draftingAi ? 'Drafting...' : 'Draft with Groq AI'}</span>
          </button>

          {/* Quick Replies Toggle */}
          <button
            type="button"
            onClick={() => setQuickRepliesOpen(!quickRepliesOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Replies</span>
          </button>

          {/* Character and Segment Counter */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 px-2 py-1 bg-slate-100 rounded-lg">
            <span className="font-bold text-slate-900">{charCount}</span>
            <span>chars</span>
            <span>•</span>
            <span className="font-bold text-amber-700">
              {segments} seg{segments > 1 ? 's' : ''}
            </span>
            <span className="text-[9px] text-slate-400 font-sans">
              ({remainingInSegment} left in seg)
            </span>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{sending ? 'Sending...' : 'Send SMS'}</span>
        </button>
      </div>
    </div>
  );
};

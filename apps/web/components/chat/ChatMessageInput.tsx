"use client";

import React, { useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";

export interface ChatMessageInputProps {
  inputText: string;
  onInputTextChange: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function ChatMessageInput({
  inputText,
  onInputTextChange,
  onSendMessage,
  onFileUpload,
  isUploading,
}: ChatMessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={onSendMessage}
      className="p-2.5 bg-white border-t border-slate-100 shrink-0 flex gap-2 items-center"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[var(--brand-700)] hover:bg-purple-50 transition-colors shrink-0 cursor-pointer"
      >
        {isUploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Paperclip size={16} />
        )}
      </button>

      <input
        type="text"
        value={inputText}
        onChange={(e) => onInputTextChange(e.target.value)}
        placeholder="Type your message..."
        disabled={isUploading}
        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!inputText.trim() || isUploading}
        className="w-8 h-8 bg-[var(--brand-600)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--brand-700)] disabled:opacity-40 transition-colors shrink-0 shadow-2xs cursor-pointer active:scale-[0.96]"
      >
        <Send size={14} />
      </button>
    </form>
  );
}

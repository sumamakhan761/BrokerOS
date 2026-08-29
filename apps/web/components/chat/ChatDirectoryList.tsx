"use client";

import React from "react";
import { User, MessageCircle } from "lucide-react";
import type { Contact } from "./types";

export interface ChatDirectoryListProps {
  contacts: Contact[];
  onStartDirectChat: (targetUserId: string, targetName: string) => void;
}

export function ChatDirectoryList({
  contacts,
  onStartDirectChat,
}: ChatDirectoryListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400 text-xs font-semibold">
        No colleagues available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() =>
            onStartDirectChat(
              contact.id,
              contact.name || "Unknown"
            )
          }
          className="p-3 hover:bg-white rounded-2xl cursor-pointer flex items-center gap-3 transition-colors mb-1 shadow-2xs border border-transparent hover:border-slate-200/60"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[var(--text-primary)] text-xs truncate m-0">
              {contact.name || contact.email}
            </h4>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-extrabold mt-0.5 m-0">
              {contact.role?.name || contact.role?.code?.replace(/_/g, " ")}
            </p>
          </div>
          <MessageCircle size={14} className="text-slate-400" />
        </div>
      ))}
    </div>
  );
}

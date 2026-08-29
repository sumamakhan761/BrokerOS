"use client";

import React, { RefObject } from "react";
import { FileText, Loader2 } from "lucide-react";
import type { Message } from "./types";

export interface ChatMessageFeedProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChatMessageFeed({
  messages,
  currentUserId,
  isLoading,
  messagesEndRef,
}: ChatMessageFeedProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 size={20} className="animate-spin text-[var(--brand-600)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
      {messages.map((msg, idx) => {
        const isMe = msg.senderId === currentUserId;
        return (
          <div
            key={`${msg.id}-${idx}`}
            className={`flex flex-col max-w-[85%] ${
              isMe ? "self-end items-end" : "self-start items-start"
            }`}
          >
            {!isMe && (
              <span className="text-[9px] text-[var(--text-muted)] ml-1 mb-1 font-bold">
                {msg.sender.name}
              </span>
            )}
            <div
              className={`px-3.5 py-2 rounded-2xl shadow-2xs ${
                isMe
                  ? "bg-[var(--brand-600)] text-white rounded-tr-xs"
                  : "bg-white border border-slate-200/80 text-[var(--text-primary)] rounded-tl-xs"
              }`}
            >
              {msg.attachmentUrl && (
                <div className="mb-2">
                  {msg.attachmentType?.startsWith("image/") ? (
                    <a
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={msg.attachmentUrl}
                        alt="attachment"
                        className="rounded-xl max-w-full max-h-48 object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        isMe
                          ? "bg-purple-700/50 border-purple-400 text-white"
                          : "bg-slate-50 border-slate-200 text-[var(--text-primary)]"
                      } text-xs font-semibold no-underline`}
                    >
                      <FileText size={14} />
                      <span className="truncate max-w-[150px]">
                        {msg.attachmentName || "Attachment"}
                      </span>
                    </a>
                  )}
                </div>
              )}
              {(!msg.attachmentUrl || msg.content !== "Sent an attachment") && (
                <p className="text-xs leading-relaxed whitespace-pre-wrap m-0 font-medium">
                  {msg.content}
                </p>
              )}
            </div>
            <span className="text-[9px] text-[var(--text-muted)] mt-1 mx-1 font-semibold tabular-nums">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

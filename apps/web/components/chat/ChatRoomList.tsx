"use client";

import React from "react";
import { User, Loader2 } from "lucide-react";
import type { ChatRoom } from "./types";

export interface ChatRoomListProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  onSelectRoom: (roomId: string, roomName: string) => void;
}

export function ChatRoomList({
  rooms,
  isLoading,
  onSelectRoom,
}: ChatRoomListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 size={20} className="animate-spin text-[var(--brand-600)]" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400 text-xs font-semibold">
        No recent conversations
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelectRoom(room.id, room.name)}
          className="p-3 hover:bg-white rounded-2xl cursor-pointer flex items-center gap-3 transition-colors mb-1 shadow-2xs border border-transparent hover:border-slate-200/60"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] shrink-0 border border-purple-200">
            {room.avatarUrl ? (
              <img
                src={room.avatarUrl}
                className="w-full h-full rounded-xl object-cover"
                alt="avatar"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className="font-bold text-[var(--text-primary)] text-xs truncate m-0">
                {room.name}
              </h4>
              {room.lastMessage && (
                <span className="text-[9px] text-[var(--text-muted)] shrink-0 ml-2 font-medium tabular-nums">
                  {new Date(room.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate m-0">
              {room.lastMessage?.content || "No messages yet"}
            </p>
          </div>
          {room.unreadCount > 0 && (
            <div className="w-4 h-4 bg-[var(--brand-600)] text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs tabular-nums">
              {room.unreadCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  X,
  Maximize2,
  Minimize2,
  ArrowLeft,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { authClient } from "@/lib/auth-client";
import { ChatRoomList } from "./ChatRoomList";
import { ChatDirectoryList } from "./ChatDirectoryList";
import { ChatMessageFeed } from "./ChatMessageFeed";
import { ChatMessageInput } from "./ChatMessageInput";
import type { ChatRoom, Contact, Message } from "./types";

export function ChatWidget() {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;
  const token = session?.session?.token;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "directory">("recent");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>("");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputText, setInputText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  // Setup Global Socket for Chat
  useEffect(() => {
    if (!userId) return;

    let authToken = token;
    if (!authToken && typeof document !== "undefined") {
      authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("better-auth.session_token="))
        ?.split("=")[1];
    }

    const SOCKET_URL = "http://localhost:3333";

    const newSocket = io(SOCKET_URL, {
      query: { userId },
      auth: { token: authToken },
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("new_message", (msg: Message) => {
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.id === msg.id ||
              (m.senderId === msg.senderId &&
                m.content === msg.content &&
                m.createdAt.startsWith(msg.createdAt.substring(0, 16)))
          )
        ) {
          return prev.map((m) =>
            m.senderId === msg.senderId && m.content === msg.content
              ? { ...m, id: msg.id, createdAt: msg.createdAt }
              : m
          );
        }
        return [...prev, msg];
      });
      fetchRooms();
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [userId, API_URL]);

  // Join/Leave active room via Socket
  useEffect(() => {
    if (socket && activeRoomId) {
      socket.emit("join_room", { roomId: activeRoomId });
    }
    return () => {
      if (socket && activeRoomId) {
        socket.emit("leave_room", { roomId: activeRoomId });
      }
    };
  }, [socket, activeRoomId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Rooms & Contacts on open
  useEffect(() => {
    if (isOpen && !activeRoomId) {
      fetchRooms();
      fetchContacts();
    }
  }, [isOpen, activeRoomId]);

  // Fetch Messages when room changes
  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
    }
  }, [activeRoomId]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json();
      if (json.success) setRooms(json.data);
    } catch (e) {
      console.error(e);
    }
    setLoadingRooms(false);
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/contacts`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json();
      if (json.success) setContacts(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json();
      if (json.success) {
        setMessages(json.data.reverse());
      }

      await fetch(`${API_URL}/api/chat/rooms/${roomId}/read`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      fetchRooms();
    } catch (e) {
      console.error(e);
    }
    setLoadingMessages(false);
  };

  const startDirectChat = async (targetUserId: string, targetName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/direct/${targetUserId}`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json();
      if (json.success) {
        setActiveRoomName(targetName);
        setActiveRoomId(json.data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomId || !socket) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/chat/upload`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.data?.url) {
        const attachment = {
          url: json.data.url,
          type: json.data.type,
          name: json.data.name,
        };
        const messageContent = inputText.trim() || `Sent an attachment`;

        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
          id: tempId,
          content: messageContent,
          createdAt: new Date().toISOString(),
          senderId: userId,
          sender: {
            id: userId,
            name: session?.user?.name || "Me",
            image: session?.user?.image || null,
          },
          attachmentUrl: attachment.url,
          attachmentType: attachment.type,
          attachmentName: attachment.name,
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText("");

        socket.emit("send_message", {
          roomId: activeRoomId,
          content: messageContent,
          attachment,
        });
      }
    } catch (e) {
      console.error("Upload failed", e);
    }

    setIsUploading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId || !socket || isUploading) return;

    const messageContent = inputText.trim();
    setInputText("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: userId,
      sender: {
        id: userId,
        name: session?.user?.name || "Me",
        image: session?.user?.image || null,
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    socket.emit("send_message", {
      roomId: activeRoomId,
      content: messageContent,
    });
  };

  if (!userId) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.96] press-effect z-50 flex items-center justify-center cursor-pointer"
        title="Open Team Messenger"
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out animate-enter ${
        isExpanded
          ? "bottom-[6vh] right-[6vw] w-[88vw] h-[86vh] rounded-3xl"
          : "bottom-20 right-6 w-[360px] h-[540px] rounded-3xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50/80 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          {activeRoomId && (
            <button
              onClick={() => {
                setActiveRoomId(null);
                setActiveRoomName("");
              }}
              className="w-7 h-7 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight m-0">
            {activeRoomId ? activeRoomName : "Team Messenger"}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
        {/* Chat List & Directory View */}
        {!activeRoomId && (
          <>
            <div className="flex p-2 border-b border-slate-100 shrink-0 bg-white/70 gap-1.5">
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "recent"
                    ? "bg-purple-50 text-[var(--brand-700)] border border-purple-200"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Recent Chats
              </button>
              <button
                onClick={() => setActiveTab("directory")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "directory"
                    ? "bg-purple-50 text-[var(--brand-700)] border border-purple-200"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Team Directory
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5">
              {activeTab === "recent" && (
                <ChatRoomList
                  rooms={rooms}
                  isLoading={loadingRooms}
                  onSelectRoom={(id, name) => {
                    setActiveRoomId(id);
                    setActiveRoomName(name);
                  }}
                />
              )}

              {activeTab === "directory" && (
                <ChatDirectoryList
                  contacts={contacts}
                  onStartDirectChat={startDirectChat}
                />
              )}
            </div>
          </>
        )}

        {/* Active Room View */}
        {activeRoomId && (
          <>
            <ChatMessageFeed
              messages={messages}
              currentUserId={userId}
              isLoading={loadingMessages}
              messagesEndRef={messagesEndRef}
            />

            <ChatMessageInput
              inputText={inputText}
              onInputTextChange={setInputText}
              onSendMessage={sendMessage}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
            />
          </>
        )}
      </div>
    </div>
  );
}

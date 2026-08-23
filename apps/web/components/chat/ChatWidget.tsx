"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Send, ArrowLeft, User, Paperclip, FileText, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { authClient } from "@/lib/auth-client";

type ChatRoom = {
  id: string;
  name: string;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessage: { content: string; createdAt: string } | null;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: { name: string; code: string };
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image: string | null };
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
};

export function ChatWidget() {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;
  const token = session?.session?.token;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'directory'>('recent');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>('');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputText, setInputText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  // Setup Global Socket for Chat
  useEffect(() => {
    if (!userId) return;

    let authToken = token;
    if (!authToken && typeof document !== 'undefined') {
      authToken = document.cookie.split('; ').find(row => row.startsWith('better-auth.session_token='))?.split('=')[1];
    }

    const SOCKET_URL = "http://localhost:3333";

    const newSocket = io(SOCKET_URL, {
      query: { userId },
      auth: { token: authToken },
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("new_message", (msg: Message) => {
      // If we are currently in the room where the message was sent, append it
      setMessages(prev => {
        // Prevent duplicates (e.g. from optimistic UI)
        if (prev.some(m => m.id === msg.id || (m.senderId === msg.senderId && m.content === msg.content && m.createdAt.startsWith(msg.createdAt.substring(0, 16))))) {
          // If we find an optimistic match (same sender, same content, same minute), we can replace its temporary ID with the real one
          return prev.map(m => (m.senderId === msg.senderId && m.content === msg.content) ? { ...m, id: msg.id, createdAt: msg.createdAt } : m);
        }
        return [...prev, msg];
      });
      // Also refresh rooms list to update latest message previews
      fetchRooms();
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [userId, API_URL]);

  // Join/Leave active room via Socket
  useEffect(() => {
    if (socket && activeRoomId) {
      socket.emit('join_room', { roomId: activeRoomId });
    }
    return () => {
      if (socket && activeRoomId) {
        socket.emit('leave_room', { roomId: activeRoomId });
      }
    };
  }, [socket, activeRoomId]);

  // Scroll to bottom when messages update
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
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const json = await res.json();
      if (json.success) setRooms(json.data);
    } catch (e) { console.error(e); }
    setLoadingRooms(false);
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/contacts`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const json = await res.json();
      if (json.success) setContacts(json.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const json = await res.json();
      if (json.success) {
        // Reverse array because REST might return DESC, we need ASC for chat view
        setMessages(json.data.reverse());
      }

      // Mark as read
      await fetch(`${API_URL}/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      fetchRooms(); // Update unread badges
    } catch (e) { console.error(e); }
    setLoadingMessages(false);
  };

  const startDirectChat = async (targetUserId: string, targetName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/direct/${targetUserId}`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const json = await res.json();
      if (json.success) {
        setActiveRoomName(targetName);
        setActiveRoomId(json.data.id);
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomId || !socket) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(`${API_URL}/api/chat/upload`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData
      });
      const json = await res.json();
      
      if (json.success && json.data?.url) {
        // Send message with just attachment (or input text if any)
        const attachment = { url: json.data.url, type: json.data.type, name: json.data.name };
        const messageContent = inputText.trim() || `Sent an attachment`;
        
        // Optimistic UI Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
          id: tempId,
          content: messageContent,
          createdAt: new Date().toISOString(),
          senderId: userId,
          sender: { 
            id: userId, 
            name: session?.user?.name || "Me", 
            image: session?.user?.image || null 
          },
          attachmentUrl: attachment.url,
          attachmentType: attachment.type,
          attachmentName: attachment.name
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText("");
        
        // Send via socket
        socket.emit('send_message', { roomId: activeRoomId, content: messageContent, attachment });
      }
    } catch (e) {
      console.error("Upload failed", e);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId || !socket || isUploading) return;

    const messageContent = inputText.trim();
    setInputText("");

    // Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: userId,
      sender: { 
        id: userId, 
        name: session?.user?.name || "Me", 
        image: session?.user?.image || null 
      }
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    // Send via socket
    socket.emit('send_message', { roomId: activeRoomId, content: messageContent });
  };

  if (!userId) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all z-50 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed z-50 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isExpanded
      ? "bottom-[10vh] right-[10vw] w-[80vw] h-[80vh] rounded-3xl"
      : "bottom-24 right-6 w-[360px] h-[550px] rounded-2xl"
      }`}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/60 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          {activeRoomId && (
            <button onClick={() => { setActiveRoomId(null); setActiveRoomName(''); }} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">
            {activeRoomId ? activeRoomName : "Messages"}
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">

        {/* Chat List & Directory View */}
        {!activeRoomId && (
          <>
            <div className="flex p-2 border-b border-slate-100 shrink-0 bg-white/30">
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'recent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'directory' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
              >
                Directory
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'recent' && (
                loadingRooms ? (
                  <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : rooms.length === 0 ? (
                  <div className="text-center p-8 text-slate-400 text-sm">No recent messages</div>
                ) : (
                  rooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => { setActiveRoomId(room.id); setActiveRoomName(room.name); }}
                      className="p-4 hover:bg-white/60 border-b border-slate-50/50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                        {room.avatarUrl ? <img src={room.avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" /> : <User size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{room.name}</h4>
                          {room.lastMessage && <span className="text-[10px] text-slate-400 shrink-0 ml-2">{new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{room.lastMessage?.content || "No messages yet"}</p>
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-indigo-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  ))
                )
              )}

              {activeTab === 'directory' && (
                contacts.length === 0 ? (
                  <div className="text-center p-8 text-slate-400 text-sm">No contacts available</div>
                ) : (
                  contacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => startDirectChat(contact.id, contact.name || 'Unknown')}
                      className="p-4 hover:bg-white/60 border-b border-slate-50/50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <User size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{contact.name || contact.email}</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{contact.role?.name || contact.role?.code.replace(/_/g, ' ')}</p>
                      </div>
                      <MessageCircle size={16} className="text-slate-300" />
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}

        {/* Active Room View */}
        {activeRoomId && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {loadingMessages ? (
                <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === userId;
                  return (
                    <div key={`${msg.id}-${idx}`} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      {!isMe && <span className="text-[10px] text-slate-400 ml-1 mb-1 font-medium">{msg.sender.name}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMe
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                        }`}>
                        {msg.attachmentUrl && (
                          <div className="mb-2">
                            {msg.attachmentType?.startsWith('image/') ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noreferrer">
                                <img src={msg.attachmentUrl} alt="attachment" className="rounded-lg max-w-full max-h-48 object-cover" />
                              </a>
                            ) : (
                              <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg border ${isMe ? 'bg-indigo-700/50 border-indigo-500' : 'bg-slate-50 border-slate-200'} text-xs font-medium`}>
                                <FileText size={16} />
                                <span className="truncate max-w-[150px]">{msg.attachmentName || 'Attachment'}</span>
                              </a>
                            )}
                          </div>
                        )}
                        {(!msg.attachmentUrl || msg.content !== 'Sent an attachment') && (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 mx-1 font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 shrink-0 flex gap-2 items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors shrink-0"
              >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isUploading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isUploading}
                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0 shadow-sm"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Authorization': session?.session?.token ? `Bearer ${session.session.token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);

    // Setup WebSocket
    let authToken = session?.session?.token;
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

    newSocket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, APP_URL]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: any) => {
    setIsOpen(false);

    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch(`${API_URL}/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': session?.session?.token ? `Bearer ${session.session.token}` : ''
          }
        });
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-xl mb-1 cursor-pointer transition-all ${notification.isRead
                    ? 'bg-transparent hover:bg-slate-50 opacity-70'
                    : 'bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50'
                    }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {notification.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm ${notification.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      {notification.body && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

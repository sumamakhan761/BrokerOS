"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
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
        Authorization: session?.session?.token
          ? `Bearer ${session.session.token}`
          : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);

    // Setup WebSocket
    let authToken = session?.session?.token;
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

    newSocket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, APP_URL, API_URL, session]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: any) => {
    setIsOpen(false);

    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch(`${API_URL}/api/notifications/${notification.id}/read`, {
          method: "PATCH",
          headers: {
            Authorization: session?.session?.token
              ? `Bearer ${session.session.token}`
              : "",
          },
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
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
        className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white tabular-nums shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden z-50 animate-enter">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
            <h3 className="font-extrabold text-[var(--text-primary)] text-xs uppercase tracking-wider m-0">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-purple-50 text-[var(--brand-700)] border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-extrabold tabular-nums">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-1.5 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs font-semibold m-0">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    notification.isRead
                      ? "bg-transparent hover:bg-slate-50 opacity-70"
                      : "bg-purple-50/60 hover:bg-purple-50 border border-purple-200/60 shadow-2xs"
                  }`}
                >
                  <div className="flex gap-2.5">
                    <div className="mt-1">
                      {notification.isRead ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[var(--brand-600)] animate-pulse shadow-2xs" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs ${
                          notification.isRead
                            ? "font-bold text-[var(--text-secondary)]"
                            : "font-extrabold text-[var(--text-primary)]"
                        } m-0 truncate`}
                      >
                        {notification.title}
                      </h4>
                      {notification.body && (
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed m-0 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-[9px] text-[var(--text-muted)] mt-1.5 font-semibold tabular-nums m-0">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        •{" "}
                        {new Date(
                          notification.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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

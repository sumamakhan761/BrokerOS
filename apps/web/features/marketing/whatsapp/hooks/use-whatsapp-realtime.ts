// ============================================================================
// BrokerOS — WhatsApp Real-Time Socket.IO Hook
// ============================================================================

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { WhatsAppMessage, WhatsAppConversation } from '../types';

interface UseWhatsAppRealtimeOptions {
  accountId?: string;
  activeConversationId?: string | null;
  onMessageReceived?: (msg: WhatsAppMessage) => void;
  onMessageSent?: (msg: WhatsAppMessage) => void;
  onMessageStatus?: (data: { conversationId: string; messageId: string; status: string }) => void;
  onConversationUpdated?: (conv: WhatsAppConversation) => void;
}

export function useWhatsAppRealtime({
  accountId,
  activeConversationId,
  onMessageReceived,
  onMessageSent,
  onMessageStatus,
  onConversationUpdated,
}: UseWhatsAppRealtimeOptions) {
  const socketRef = useRef<Socket | null>(null);

  // Keep callback refs stable to avoid re-subscribing on every render
  const callbacksRef = useRef({
    onMessageReceived,
    onMessageSent,
    onMessageStatus,
    onConversationUpdated,
  });

  useEffect(() => {
    callbacksRef.current = {
      onMessageReceived,
      onMessageSent,
      onMessageStatus,
      onConversationUpdated,
    };
  }, [onMessageReceived, onMessageSent, onMessageStatus, onConversationUpdated]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';

    const socket = io(`${socketUrl}/whatsapp`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (accountId) {
        socket.emit('join:account', { accountId });
      }
      if (activeConversationId) {
        socket.emit('join:conversation', { conversationId: activeConversationId });
      }
    });

    socket.on('wa:message:received', (data: { conversationId: string; message: WhatsAppMessage }) => {
      callbacksRef.current.onMessageReceived?.(data.message);
    });

    socket.on('wa:message:sent', (data: { conversationId: string; message: WhatsAppMessage }) => {
      callbacksRef.current.onMessageSent?.(data.message);
    });

    socket.on('wa:message:status', (data: { conversationId: string; messageId: string; status: string }) => {
      callbacksRef.current.onMessageStatus?.(data);
    });

    socket.on('wa:conversation:updated', (conv: WhatsAppConversation) => {
      callbacksRef.current.onConversationUpdated?.(conv);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accountId]);

  // When active conversation changes, join the conversation room
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.connected && activeConversationId) {
      socket.emit('join:conversation', { conversationId: activeConversationId });

      return () => {
        socket.emit('leave:conversation', { conversationId: activeConversationId });
      };
    }
  }, [activeConversationId]);

  return {
    socket: socketRef.current,
  };
}

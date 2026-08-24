import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { authClient } from '../../../lib/auth-client';
import { useSocket } from '../../../lib/SocketContext';

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
};

export default function ChatRoomScreen() {
  const insets = useSafeAreaInsets();
  const { id: roomId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as any)?.id;
  const { socket } = useSocket();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();

    if (socket && roomId) {
      socket.emit('join_room', { roomId });

      socket.on('new_message', (newMessage: Message) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [newMessage, ...prev];
        });
        markAsRead();
      });
    }

    return () => {
      if (socket && roomId) {
        socket.emit('leave_room', { roomId });
        socket.off('new_message');
      }
    };
  }, [roomId, socket]);

  const fetchMessages = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data } = await authClient.$fetch<{ success: boolean; data: Message[] }>(
      `/api/chat/rooms/${roomId}/messages`,
      { baseURL: baseUrl }
    );
    if (data?.success) {
      setMessages(data.data);
    }
    setLoading(false);
  };

  const markAsRead = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    await authClient.$fetch(`/api/chat/rooms/${roomId}/read`, {
      method: 'POST',
      baseURL: baseUrl,
    }).catch(console.error);
  };

  const sendMessageViaSocket = () => {
    if (!text.trim() || sending || !socket) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    socket.emit('send_message', { roomId, content: text.trim() });
    setText('');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const canSend = Boolean(text.trim());

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="flex-1 bg-slate-50"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUserId;
            return (
              <View className={`mb-3.5 max-w-[82%] ${isMe ? 'self-end' : 'self-start'}`}>
                {!isMe && (
                  <Text
                    className="text-xs font-bold text-slate-500 mb-1 ml-1"
                    style={{ includeFontPadding: false }}
                  >
                    {item.sender?.name || 'User'}
                  </Text>
                )}
                <View
                  className={`px-4 py-3 rounded-2xl shadow-xs ${isMe
                    ? 'bg-blue-600 rounded-tr-sm'
                    : 'bg-white rounded-tl-sm border border-slate-200/80'
                    }`}
                >
                  <Text
                    className={`text-base leading-relaxed ${isMe ? 'text-white font-medium' : 'text-slate-800'
                      }`}
                    style={{ includeFontPadding: false }}
                  >
                    {item.content}
                  </Text>
                </View>
                <Text
                  className={`text-[10px] mt-1 font-medium ${isMe ? 'text-right text-slate-400 mr-1' : 'text-slate-400 ml-1'
                    }`}
                  style={{ fontVariant: ['tabular-nums'], includeFontPadding: false }}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View className="p-3 bg-white border-t border-slate-200 flex-row items-end gap-2">
          <View className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl min-h-[46px] max-h-[110px] px-4 py-1 justify-center">
            <TextInput
              className="text-base text-slate-900 leading-tight"
              placeholder="Type a message…"
              placeholderTextColor="#94a3b8"
              multiline
              value={text}
              onChangeText={setText}
            />
          </View>

          <Pressable
            className={`w-12 h-12 rounded-2xl justify-center items-center shadow-xs active:scale-95 transition-transform ${canSend && !sending ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            disabled={!canSend || sending}
            onPress={sendMessageViaSocket}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Send
                size={18}
                color={canSend ? '#ffffff' : '#94a3b8'}
                strokeWidth={2.2}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

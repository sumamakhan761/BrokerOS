import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
  const { id: roomId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as any)?.id;
  const router = useRouter();
  const { socket } = useSocket();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();

    if (socket && roomId) {
      socket.emit('join_room', { roomId });

      socket.on('new_message', (newMessage: Message) => {
        // If message belongs to this room, append it
        setMessages(prev => {
          // Check if it already exists to avoid duplicates (since we also add locally on send)
          if (prev.some(m => m.id === newMessage.id)) return prev;
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
    const { data, error } = await authClient.$fetch<{ success: boolean; data: Message[] }>(`/api/chat/rooms/${roomId}/messages`, {
      baseURL: baseUrl,
    });
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

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    
    setSending(true);
    const messageContent = text.trim();
    setText(''); // Optimistic clear

    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data, error } = await authClient.$fetch<{ success: boolean; data: Message }>(`/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json' },
      body: { content: messageContent }
    });

    if (data?.success && socket) {
      // Broadcast via socket is handled by the backend ChatGateway on `send_message` event
      // Alternatively, since backend triggers via REST we just emit here to inform others (or let backend do it).
      // Our backend REST endpoint does NOT broadcast. Oh wait, in chat.gateway.ts we added a 'send_message' socket event.
      // So instead of calling REST, we can emit 'send_message' via socket to be fully real-time!
      
      // Let's use the REST response and rely on the socket for incoming. 
      // Actually, since our gateway `handleSendMessage` handles saving + broadcasting, we could just use socket.emit('send_message').
      // But we already sent via REST here. Let's just emit 'new_message' manually? No, if we sent via REST, the REST endpoint in backend should have broadcasted, but it didn't (we noted it in controller).
      // Let's fix this by using the socket to send instead!
    }
    
    setSending(false);
  };

  const sendMessageViaSocket = () => {
    if (!text.trim() || sending || !socket) return;
    socket.emit('send_message', { roomId, content: text.trim() });
    setText('');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          inverted // starts from bottom
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUserId;
            return (
              <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                {!isMe && (
                  <Text className="text-xs text-gray-500 mb-1 ml-1">{item.sender.name}</Text>
                )}
                <View className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-tr-sm' : 'bg-white rounded-tl-sm border border-gray-100 shadow-sm'}`}>
                  <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
                    {item.content}
                  </Text>
                </View>
                <Text className={`text-[10px] mt-1 ${isMe ? 'text-right text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />

        <View className="p-3 bg-white border-t border-gray-200 flex-row items-end">
          <View className="flex-1 bg-[#f1f5f9] rounded-2xl min-h-[48px] max-h-[120px] px-4 py-2 mr-3 justify-center">
            <TextInput
              className="text-base text-gray-800"
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              multiline
              value={text}
              onChangeText={setText}
            />
          </View>
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full justify-center items-center ${text.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
            disabled={!text.trim() || sending}
            onPress={sendMessageViaSocket}
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Feather name="send" size={20} color="white" style={{ marginLeft: -2 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

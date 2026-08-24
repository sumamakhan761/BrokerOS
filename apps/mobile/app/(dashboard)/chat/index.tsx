import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, Users, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { authClient } from '../../../lib/auth-client';
import { useSocket } from '../../../lib/SocketContext';
import { Avatar } from '@/components/ui/Avatar';

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

export default function ChatListScreen() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'contacts'>('rooms');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('new_message', () => {
        // Refresh rooms when a new message arrives to update latest message & unread count
        fetchRooms();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRooms(), fetchContacts()]);
    setLoading(false);
  };

  const fetchRooms = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data } = await authClient.$fetch<{ success: boolean; data: ChatRoom[] }>('/api/chat/rooms', {
      baseURL: baseUrl,
    });
    if (data?.success) {
      setRooms(data.data);
    }
  };

  const fetchContacts = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data } = await authClient.$fetch<{ success: boolean; data: Contact[] }>('/api/chat/contacts', {
      baseURL: baseUrl,
    });
    if (data?.success) {
      setContacts(data.data);
    }
  };

  const handleTabChange = (tab: 'rooms' | 'contacts') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const startChatWithContact = async (contactId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data } = await authClient.$fetch<{ success: boolean; data: { id: string } }>(`/api/chat/direct/${contactId}`, {
      method: 'POST',
      baseURL: baseUrl,
    });
    if (data?.success) {
      router.push(`/(dashboard)/chat/${data.data.id}` as any);
    }
  };

  const handleRoomPress = (roomId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(dashboard)/chat/${roomId}` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Tab Navigation */}
      <View className="flex-row bg-white border-b border-slate-200 shadow-xs">
        <Pressable
          className={`flex-1 py-3.5 items-center border-b-2 active:bg-slate-50 ${
            activeTab === 'rooms' ? 'border-blue-600' : 'border-transparent'
          }`}
          onPress={() => handleTabChange('rooms')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'rooms' }}
        >
          <Text
            className={`font-extrabold text-sm ${
              activeTab === 'rooms' ? 'text-blue-600' : 'text-slate-500'
            }`}
            style={{ includeFontPadding: false }}
          >
            Recent Chats ({rooms.length})
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-3.5 items-center border-b-2 active:bg-slate-50 ${
            activeTab === 'contacts' ? 'border-blue-600' : 'border-transparent'
          }`}
          onPress={() => handleTabChange('contacts')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'contacts' }}
        >
          <Text
            className={`font-extrabold text-sm ${
              activeTab === 'contacts' ? 'text-blue-600' : 'text-slate-500'
            }`}
            style={{ includeFontPadding: false }}
          >
            Directory ({contacts.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'rooms' ? (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50 transition-colors"
              onPress={() => handleRoomPress(item.id)}
            >
              <Avatar
                name={item.name}
                imageUri={item.avatarUrl}
                size={48}
              />

              <View className="flex-1 ml-3.5">
                <View className="flex-row justify-between items-center mb-0.5">
                  <Text
                    className="text-base font-bold text-slate-900 leading-tight flex-1 pr-2"
                    numberOfLines={1}
                    style={{ includeFontPadding: false }}
                  >
                    {item.name}
                  </Text>
                  {item.lastMessage && (
                    <Text
                      className="text-xs text-slate-400 font-medium"
                      style={{ fontVariant: ['tabular-nums'], includeFontPadding: false }}
                    >
                      {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>

                <View className="flex-row justify-between items-center mt-0.5">
                  <Text
                    className="text-sm text-slate-500 flex-1 pr-2"
                    numberOfLines={1}
                    style={{ includeFontPadding: false }}
                  >
                    {item.lastMessage ? item.lastMessage.content : 'No messages yet'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className="bg-blue-600 rounded-full min-w-[20px] h-5 px-1.5 justify-center items-center">
                      <Text
                        className="text-white text-[10px] font-black"
                        style={{ includeFontPadding: false }}
                      >
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20 px-8">
              <View className="w-16 h-16 bg-slate-100 rounded-3xl items-center justify-center mb-3">
                <MessageSquare size={32} color="#94a3b8" />
              </View>
              <Text className="text-base font-bold text-slate-800">No recent conversations</Text>
              <Text className="text-xs text-slate-400 mt-1 text-center font-medium">
                Tap the Directory tab above to start messaging team members.
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50 transition-colors"
              onPress={() => startChatWithContact(item.id)}
            >
              <Avatar
                name={item.name}
                imageUri={item.image}
                size={48}
              />

              <View className="flex-1 ml-3.5">
                <Text
                  className="text-base font-bold text-slate-900 leading-tight"
                  numberOfLines={1}
                  style={{ includeFontPadding: false }}
                >
                  {item.name || 'Unknown User'}
                </Text>
                <Text
                  className="text-xs text-slate-500 capitalize font-medium mt-0.5"
                  style={{ includeFontPadding: false }}
                >
                  {item.role?.name || item.role?.code.replace(/_/g, ' ')}
                </Text>
              </View>

              <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center border border-blue-100">
                <MessageCircle size={18} color="#2563eb" />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20 px-8">
              <View className="w-16 h-16 bg-slate-100 rounded-3xl items-center justify-center mb-3">
                <Users size={32} color="#94a3b8" />
              </View>
              <Text className="text-base font-bold text-slate-800">No team contacts found</Text>
              <Text className="text-xs text-slate-400 mt-1 text-center font-medium">
                Your directory contacts will populate automatically.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

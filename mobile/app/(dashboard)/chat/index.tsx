import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../lib/auth-client';
import { useSocket } from '../../../lib/SocketContext';

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
    const { data, error } = await authClient.$fetch<{ success: boolean; data: ChatRoom[] }>('/api/chat/rooms', {
      baseURL: baseUrl,
    });
    if (data?.success) {
      setRooms(data.data);
    }
  };

  const fetchContacts = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data, error } = await authClient.$fetch<{ success: boolean; data: Contact[] }>('/api/chat/contacts', {
      baseURL: baseUrl,
    });
    if (data?.success) {
      setContacts(data.data);
    }
  };

  const startChatWithContact = async (contactId: string) => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const { data, error } = await authClient.$fetch<{ success: boolean; data: { id: string } }>(`/api/chat/direct/${contactId}`, {
      method: 'POST',
      baseURL: baseUrl,
    });
    if (data?.success) {
      router.push(`/(dashboard)/chat/${data.data.id}` as any);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'rooms' ? 'border-blue-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('rooms')}
        >
          <Text className={`font-semibold ${activeTab === 'rooms' ? 'text-blue-600' : 'text-gray-500'}`}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'contacts' ? 'border-blue-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('contacts')}
        >
          <Text className={`font-semibold ${activeTab === 'contacts' ? 'text-blue-600' : 'text-gray-500'}`}>Directory</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rooms' ? (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center p-4 bg-white border-b border-gray-100"
              onPress={() => router.push(`/(dashboard)/chat/${item.id}` as any)}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-4 overflow-hidden">
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} className="w-full h-full" />
                ) : (
                  <Feather name="user" size={24} color="#3b82f6" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
                  {item.lastMessage && (
                    <Text className="text-xs text-gray-400">
                      {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-500" numberOfLines={1}>
                    {item.lastMessage ? item.lastMessage.content : 'No messages yet'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className="bg-red-500 rounded-full w-5 h-5 justify-center items-center ml-2">
                      <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center pt-10">
              <Feather name="message-square" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4">No recent chats.</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center p-4 bg-white border-b border-gray-100"
              onPress={() => startChatWithContact(item.id)}
            >
              <View className="w-12 h-12 rounded-full bg-green-100 justify-center items-center mr-4 overflow-hidden">
                {item.image ? (
                  <Image source={{ uri: item.image }} className="w-full h-full" />
                ) : (
                  <Feather name="user" size={24} color="#16a34a" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{item.name || 'Unknown User'}</Text>
                <Text className="text-xs text-gray-500 capitalize">{item.role?.name || item.role?.code.replace(/_/g, ' ')}</Text>
              </View>
              <Feather name="message-circle" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center pt-10">
              <Feather name="users" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4">No available contacts.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

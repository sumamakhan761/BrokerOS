import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { authClient } from '../../lib/auth-client';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': session?.session?.token ? `Bearer ${session.session.token}` : ''
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (item: any) => {
    if (!item.isRead) {
      try {
        await fetch(`${API_URL}/api/notifications/${item.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': session?.session?.token ? `Bearer ${session.session.token}` : ''
          }
        });
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
    if (item.actionUrl && typeof item.actionUrl === 'string') {
      let routeUrl = item.actionUrl;
      if (routeUrl.startsWith('/dashboard/')) {
        routeUrl = routeUrl.replace('/dashboard/', '/');
      }
      router.push(routeUrl as any);
    }
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text className="text-center mt-10 text-slate-500">No notifications</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            className={`p-4 rounded-xl mb-3 flex-row gap-3 items-start border ${item.isRead ? 'bg-white border-slate-200' : 'bg-indigo-50 border-indigo-100'}`}
          >
            <View className="mt-1">
              <Feather name="bell" size={20} color={item.isRead ? '#64748b' : '#4f46e5'} />
            </View>
            <View className="flex-1">
              <Text className={`text-base ${item.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                {item.title}
              </Text>
              {item.body && (
                <Text className="text-sm text-slate-500 mt-1">{item.body}</Text>
              )}
              <Text className="text-xs text-slate-400 mt-2">
                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

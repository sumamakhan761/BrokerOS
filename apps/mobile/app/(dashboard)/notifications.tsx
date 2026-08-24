import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { authClient } from '../../lib/auth-client';
import { useRouter } from 'expo-router';
import { Bell, CheckCheck, Inbox, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: session?.session?.token ? `Bearer ${session.session.token}` : '',
        },
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!item.isRead) {
      try {
        await fetch(`${API_URL}/api/notifications/${item.id}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: session?.session?.token ? `Bearer ${session.session.token}` : '',
          },
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
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
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-xs font-semibold text-slate-400 mt-2">Loading updates…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-16 items-center justify-center bg-white rounded-3xl p-8 border border-slate-200/80 mt-4 text-center">
            <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center border border-blue-200/60 mb-3">
              <Inbox size={22} color="#2563eb" />
            </View>
            <Text className="text-sm font-extrabold text-slate-800">All Caught Up!</Text>
            <Text className="text-xs text-slate-400 font-medium mt-0.5 text-center">
              You have no unread team alerts or follow-up notifications.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            className={`p-4 rounded-3xl mb-3 flex-row gap-3.5 items-start border shadow-2xs active:scale-[0.98] transition-transform ${
              item.isRead
                ? 'bg-white border-slate-200/80'
                : 'bg-blue-50/70 border-blue-200/90'
            }`}
          >
            <View
              className={`w-10 h-10 rounded-2xl items-center justify-center shrink-0 border ${
                item.isRead
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-blue-100 border-blue-300/80'
              }`}
            >
              <Bell size={18} color={item.isRead ? '#64748b' : '#1d4ed8'} />
            </View>
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  className={`text-xs ${
                    item.isRead ? 'font-bold text-slate-800' : 'font-extrabold text-blue-950'
                  } truncate`}
                >
                  {item.title}
                </Text>
                {!item.isRead && (
                  <View className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                )}
              </View>
              {item.body && (
                <Text className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {item.body}
                </Text>
              )}
              <Text className="text-[10px] font-semibold text-slate-400 mt-2 tabular-nums">
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                })}{' '}
                •{' '}
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

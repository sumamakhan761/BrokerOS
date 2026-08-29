import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import { Bell, MessageSquare, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import * as Haptics from 'expo-haptics';

import { authClient } from '../../lib/auth-client';
import { SocketContext } from '../../lib/SocketContext';
import { setAuthTokenForBackground, startListening, stopListening } from '../../modules/auto-dialer';
import { useCallStatus } from '../../hooks/useCallStatus';
import { useDashboardNotifications } from '../../hooks/useDashboardNotifications';
import {
  ALL_POSSIBLE_SCREENS,
  getNavLinksForRole,
  renderTabIcon,
} from '../../constants/navigation';

export default function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [roleCode, setRoleCode] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const user = session?.user as any;
  const { unreadCount, setUnreadCount } = useDashboardNotifications(user);

  // Register the native PhoneStateListener so onCallStarted/onCallEnded events fire
  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, []);

  // Sync on-call status to backend whenever a call starts/ends (foreground path)
  useCallStatus();

  useEffect(() => {
    if (user?.roleId) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      fetch(`${baseUrl}/roles`)
        .then((res) => res.json())
        .then((roles) => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role) setRoleCode(role.code);
        })
        .catch(console.error);

      // Pass token to native module for background recording uploads
      if (session?.session?.token) {
        setAuthTokenForBackground(String(session.session.token), baseUrl);
      } else {
        SecureStore.getItemAsync('better-auth_cookie').then((cookieJson) => {
          if (cookieJson) {
            try {
              const cookies = JSON.parse(cookieJson);
              let token = cookies['better-auth.session_token'];

              if (token) {
                if (typeof token === 'object' && token.value) {
                  token = token.value;
                } else if (typeof token === 'object') {
                  token = JSON.stringify(token);
                }
                setAuthTokenForBackground(String(token), baseUrl);
              }
            } catch (e) {
              console.error('Failed to parse better-auth_cookie', e);
            }
          }
        });
      }

      const newSocket = io(baseUrl, {
        query: { userId: user.id },
        transports: ['websocket'],
      });

      newSocket.on('new_notification', () => {
        setUnreadCount((prev) => prev + 1);
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isPending, session, setUnreadCount, user]);

  if (isPending || !session) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const userRole = roleCode || 'UNKNOWN';
  const navLinks = getNavLinksForRole(userRole);

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authClient.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 1,
            shadowColor: '#0f172a',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          },
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 17,
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e2e8f0',
            elevation: 10,
            paddingBottom: 6,
            height: 62,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            paddingBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarItemStyle: { display: 'none' },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(dashboard)/chat' as any);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-200/80 mr-2.5 active:scale-95"
              >
                <MessageSquare size={18} color="#0f172a" />
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUnreadCount(0);
                  router.push('/(dashboard)/notifications');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-200/80 mr-2.5 active:scale-95 relative"
              >
                <Bell size={18} color="#0f172a" />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-rose-600 rounded-full min-w-[16px] h-4 px-1 items-center justify-center border border-white">
                    <Text className="text-[9px] font-black text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleSignOut}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-rose-50 items-center justify-center border border-rose-200/80 active:scale-95"
              >
                <LogOut size={17} color="#e11d48" />
              </Pressable>
            </View>
          ),
        }}
      >
        {ALL_POSSIBLE_SCREENS.map((link) => {
          const isVisible = navLinks.some((nl) => nl.name === link.name);
          return (
            <Tabs.Screen
              key={link.name}
              name={link.name}
              options={{
                title: link.title,
                tabBarLabel: link.title,
                href: isVisible ? undefined : null,
                tabBarItemStyle: { display: isVisible ? 'flex' : 'none' },
                tabBarIcon: ({ color, size }) => renderTabIcon(link.icon, color, size),
              }}
              listeners={{
                tabPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
              }}
            />
          );
        })}
      </Tabs>
    </SocketContext.Provider>
  );
}

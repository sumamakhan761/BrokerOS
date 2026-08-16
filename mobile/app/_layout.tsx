import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/global.css';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { authClient } from '../lib/auth-client';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('daily-progress', {
    name: 'Daily Progress',
    importance: Notifications.AndroidImportance.LOW, // Low importance = silent
    sound: null,
    enableVibrate: false,
    showBadge: false,
  }).catch(console.error);
}

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification error:', error);
    return;
  }
  if (data) {
    const notification = (data as any).notification;
    const payload = notification?.request?.content?.data || notification?.data; // Depends on OS/foreground/background
    if (payload?.type === 'DAILY_PROGRESS' && payload?.progressString) {
      Notifications.scheduleNotificationAsync({
        identifier: 'daily_progress_tracker',
        content: {
          title: "Today's Progress",
          body: payload.progressString,
          sticky: true,
          autoDismiss: false,
          sound: false,
          // @ts-ignore
          channelId: 'daily-progress',
        },
        trigger: null,
      }).catch(console.error);
    }
  }
});

// Register the background handler early in the app lifecycle
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(console.error);

function RootLayoutNav() {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(dashboard)' as any);
    }
  }, [session, isPending, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

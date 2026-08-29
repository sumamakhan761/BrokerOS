import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { authClient } from '../lib/auth-client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null | undefined> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    return token;
  } catch (e) {
    console.log('Push Token Error:', e);
    return null;
  }
}

export function useDashboardNotifications(user: any) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Push Token Registration
  useEffect(() => {
    if (!user?.id) return;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;

    registerForPushNotificationsAsync().then((token) => {
      if (token && user?.id) {
        fetch(`${baseUrl}/api/users/${user.id}/push-token`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }).catch(console.error);
      }
    });
  }, [user?.id]);

  // 2. Notification Action Category & Listeners
  useEffect(() => {
    try {
      Notifications.setNotificationCategoryAsync('site_visit_arrive', [
        {
          identifier: 'arrive',
          buttonTitle: 'Arrive',
          options: { opensAppToForeground: false },
        },
      ]).catch(() => {});
    } catch (e) {
      console.warn('[Notifications] setNotificationCategoryAsync unavailable:', e);
    }

    let subscription: any = null;
    let receivedSubscription: any = null;

    try {
      subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
        const actionIdentifier = response.actionIdentifier;
        const data = response.notification.request.content.data;

        if (actionIdentifier === 'arrive') {
          const siteVisitId = data.siteVisitId;
          if (siteVisitId) {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Location permission is required to Arrive at a site visit.',
                });
                return;
              }
              const location = await Location.getCurrentPositionAsync({});
              const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;

              const { error } = await authClient.$fetch(
                `/api/leads/direct/site-visits/${siteVisitId}/arrive`,
                {
                  method: 'PATCH',
                  baseURL: baseUrl,
                  headers: { 'Content-Type': 'application/json' },
                  body: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  },
                }
              );

              if (!error) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Site Visit arrival confirmed!',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: (error as any)?.message || 'Failed to confirm arrival',
                });
              }
            } catch (e: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: e.message || 'Could not fetch location',
              });
            }
          }
          return;
        }

        let actionUrl = data.actionUrl;
        if (actionUrl && typeof actionUrl === 'string') {
          if (actionUrl.startsWith('/dashboard/')) {
            actionUrl = actionUrl.replace('/dashboard/', '/');
          }
          router.push(actionUrl as any);
        }
      });
    } catch (e) {
      console.warn('[Notifications] addNotificationResponseReceivedListener unavailable:', e);
    }

    try {
      receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (data?.type === 'DAILY_PROGRESS' && data?.progressString) {
          Notifications.scheduleNotificationAsync({
            identifier: 'daily_progress_tracker',
            content: {
              title: "Today's Progress",
              body: data.progressString as string,
              sticky: true,
              autoDismiss: false,
              sound: false,
              // @ts-ignore
              channelId: 'daily-progress',
            },
            trigger: null,
          }).catch(console.error);
        }
      });
    } catch (e) {
      console.warn('[Notifications] addNotificationReceivedListener unavailable:', e);
    }

    return () => {
      subscription?.remove?.();
      receivedSubscription?.remove?.();
    };
  }, [router]);

  return { unreadCount, setUnreadCount };
}

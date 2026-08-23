import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export const LOCATION_TASK_NAME = 'background-location-task';
const USER_ID_KEY = 'tracking_user_id';

// ── Background Task Definition ──
// This runs even when the app is closed. Android spawns a headless JS context for it.
// Important: In that headless context, React state, session, auth — none of it exists.
// That's why we read userId from SecureStore (which persists on disk, survives app kill).

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Error:', error);
    return;
  }

  if (data) {
    // NOTE: Off-duty hours filter is commented out for testing.
    // Uncomment this block when going to production.
    // const currentHour = new Date().getHours();
    // if (currentHour >= 23 || currentHour < 6) {
    //   console.log('Off-duty hours. Skipping.');
    //   return;
    // }

    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const loc = locations[0];
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      console.log(`[BG Location] lat=${lat}, lng=${lng}`);

      try {
        // Read the userId that was saved when tracking started
        const userId = await SecureStore.getItemAsync(USER_ID_KEY);
        if (!userId) {
          console.error('[BG Location] No userId found in SecureStore. Cannot update backend.');
          return;
        }

        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.105:3333';

        // NOTE: Distance check is commented out for testing.
        // This means every tick will hit the backend, even if the phone hasn't moved.
        // Uncomment this block when going to production.
        // const lastLat = await SecureStore.getItemAsync('last_sent_lat');
        // const lastLng = await SecureStore.getItemAsync('last_sent_lng');
        // if (lastLat && lastLng) {
        //   const dist = getDistanceMeters(Number(lastLat), Number(lastLng), lat, lng);
        //   if (dist < 10) {
        //     console.log(`[BG Location] Moved only ${dist.toFixed(1)}m. Skipping.`);
        //     return;
        //   }
        // }

        console.log(`[BG Location] Sending to backend for user: ${userId}`);
        const response = await fetch(`${apiUrl}/api/users/${userId}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });

        if (response.ok) {
          console.log('[BG Location] ✅ Saved to database!');
          // await SecureStore.setItemAsync('last_sent_lat', String(lat));
          // await SecureStore.setItemAsync('last_sent_lng', String(lng));
        } else {
          console.error('[BG Location] ❌ Backend rejected. Status:', response.status);
        }
      } catch (err) {
        console.error('[BG Location] ❌ Network error:', err);
      }
    }
  }
});

// ── Start Tracking ──
// Called automatically when user opens the dashboard (no button needed).
// Requests permissions, saves userId to SecureStore, starts background location updates.

export const startLocationTracking = async (userId: string) => {
  try {
    // 1. Request foreground permission
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      console.log('[Location] Foreground permission denied');
      return;
    }

    // 2. Request background permission
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      console.log('[Location] Background permission denied');
      return;
    }

    // 3. Check if already tracking — don't start twice
    const alreadyTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (alreadyTracking) {
      console.log('[Location] Already tracking. Updating stored userId.');
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
      return;
    }

    // 4. Save userId to SecureStore so the background task can read it
    await SecureStore.setItemAsync(USER_ID_KEY, userId);

    // 5. Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1 * 60 * 1000,    // Every 1 minute
      distanceInterval: 0,              // Even if not moving
      deferredUpdatesInterval: 1 * 60 * 1000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Live Tracking Active',
        notificationBody: 'Your location is being shared with the dashboard.',
        notificationColor: '#2563eb',
      },
    });

    console.log(`[Location] ✅ Tracking started for user: ${userId}`);
  } catch (err) {
    console.error('[Location] ❌ Error starting tracking:', err);
  }
};

// ── Stop Tracking ──

export const stopLocationTracking = async () => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    console.log('[Location] Tracking stopped.');
  }
};

// ── Helper: Distance in meters (for production use) ──

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { authClient } from '../lib/auth-client';

export function useLocationTracking(userId: string) {
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  const toggleTracking = async () => {
    if (isTracking) {
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
      setIsTracking(false);
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    setIsTracking(true);
    
    // Set up location tracking
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // Update every 30 seconds
        distanceInterval: 10, // Or every 10 meters
      },
      async (loc) => {
        // Send location to server
          try {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.105:3333';
            
            await fetch(`${baseUrl}/api/users/${userId}/location`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              })
            });
          } catch (e) {
          console.error("Failed to sync location:", e);
        }
      }
    );
    
    setLocationSubscription(sub);
  };

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  return { isTracking, toggleTracking, errorMsg };
}

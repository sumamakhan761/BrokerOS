import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';

const AudioPlayer = ({ url }: { url: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playSound() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.105:3333';
      const fullUrl = url.startsWith('/') ? `${apiUrl}${url}` : url;

      try {
        const cookieJson = await SecureStore.getItemAsync('better-auth_cookie');
        let cookieHeader = '';
        if (cookieJson) {
          try {
            const parsed = JSON.parse(cookieJson);
            cookieHeader = Object.entries(parsed).reduce((acc: string, [key, value]: any) => {
              if (value.expires && new Date(value.expires) < new Date()) return acc;
              return acc ? `${acc}; ${key}=${value.value}` : `${key}=${value.value}`;
            }, "");
          } catch (e) { }
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          {
            uri: fullUrl,
            headers: cookieHeader ? { cookie: cookieHeader } : undefined
          },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        });
      } catch (e) {
        console.error("Failed to load audio", e);
      }
    }
  }

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  return (
    <TouchableOpacity
      onPress={playSound}
      className="bg-blue-100 rounded-full w-8 h-8 items-center justify-center">
      <Feather name={isPlaying ? "pause" : "play"} size={14} color="#2563eb" />
    </TouchableOpacity>
  );
};

export default AudioPlayer;

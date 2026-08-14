import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL as string;

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    expoClient({
      scheme: "mobile",
      storage: SecureStore,
    })
  ]
});

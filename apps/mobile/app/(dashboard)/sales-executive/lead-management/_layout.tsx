import { Stack } from 'expo-router';
import React from 'react';

export default function LeadManagementLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: '#ffffff' },
      headerTintColor: '#0f172a',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: '600', fontSize: 18 },
    }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Leads',
          headerShown: false, // Will be managed by the parent tab bar, or we can show it here
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Lead Profile',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

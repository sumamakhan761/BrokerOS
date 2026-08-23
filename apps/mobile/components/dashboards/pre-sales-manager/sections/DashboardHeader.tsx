import React from 'react';
import { View, Text } from 'react-native';

export function DashboardHeader({ userName }: { userName: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a' }}>
        Hello, {userName.split(' ')[0]} 👋
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
        Team Performance Overview
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';

export function Avatar({ name, size = 32 }: { name?: string; size?: number }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#0ea5e9'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: colors[colorIdx],
      justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

const SIZE_MAP: Record<string, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
  '2xl': 72,
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: '#22c55e',
  offline: '#94a3b8',
  away: '#f59e0b',
  busy: '#ef4444',
};

// Deterministic modern brand & semantic colors for initials background
const PALETTE = [
  { bg: '#2563eb', text: '#ffffff' }, // Blue
  { bg: '#4f46e5', text: '#ffffff' }, // Indigo
  { bg: '#7c3aed', text: '#ffffff' }, // Violet
  { bg: '#0891b2', text: '#ffffff' }, // Cyan
  { bg: '#059669', text: '#ffffff' }, // Emerald
  { bg: '#d97706', text: '#ffffff' }, // Amber
  { bg: '#e11d48', text: '#ffffff' }, // Rose
  { bg: '#475569', text: '#ffffff' }, // Slate
];

export interface AvatarProps {
  name?: string;
  imageUri?: string | null;
  uri?: string | null;
  src?: string | null;
  size?: AvatarSize;
  status?: AvatarStatus;
  badge?: React.ReactNode;
  shape?: 'circle' | 'rounded';
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Avatar({
  name,
  imageUri,
  uri,
  src,
  size = 32,
  status,
  badge,
  shape = 'circle',
  className = '',
  style,
  accessibilityLabel,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const finalUri = imageUri || uri || src;
  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] || 32;
  const borderRadius = shape === 'circle' ? dimension / 2 : Math.max(8, dimension * 0.25);
  const statusSize = Math.max(7, Math.round(dimension * 0.28));

  // Compute initials
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?'
    : '?';

  // Compute color based on name hash
  const colorIndex = name
    ? Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PALETTE.length
    : 0;
  const colorTheme = PALETTE[colorIndex];

  const fontSize = Math.round(dimension * 0.4);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || name || 'User Avatar'}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius,
        },
        style,
      ]}
      className={`relative justify-center items-center overflow-visible select-none ${className}`}
    >
      {/* Avatar Container */}
      <View
        style={{
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor: finalUri && !imageError ? '#e2e8f0' : colorTheme.bg,
        }}
        className="overflow-hidden justify-center items-center border border-black/5 dark:border-white/10"
      >
        {finalUri && !imageError ? (
          <Image
            source={{ uri: finalUri }}
            style={{ width: dimension, height: dimension }}
            contentFit="cover"
            transition={150}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            style={{
              color: colorTheme.text,
              fontSize,
              fontWeight: '700',
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
          >
            {initials}
          </Text>
        )}
      </View>

      {/* Status Dot */}
      {status && (
        <View
          style={{
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
            backgroundColor: STATUS_COLORS[status],
            position: 'absolute',
            bottom: -1,
            right: -1,
            borderWidth: Math.max(1.5, dimension * 0.06),
            borderColor: '#ffffff',
          }}
        />
      )}

      {/* Custom Corner Badge */}
      {badge && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
          }}
        >
          {badge}
        </View>
      )}
    </View>
  );
}

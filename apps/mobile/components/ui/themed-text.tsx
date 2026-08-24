import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'caption' | 'label' | 'link' | 'mono';
  tabularNums?: boolean;
  maxMultiplier?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  tabularNums = false,
  maxMultiplier = 1.3,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      maxFontSizeMultiplier={maxMultiplier}
      style={[
        {
          color,
          includeFontPadding: false,
          textAlignVertical: 'center',
          ...(tabularNums ? { fontVariant: ['tabular-nums'] } : {}),
        },
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'label' ? styles.label : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'mono' ? styles.mono : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2563eb',
    fontWeight: '600',
  },
  mono: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});

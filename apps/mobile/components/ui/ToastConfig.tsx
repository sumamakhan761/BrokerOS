import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// ─── Shared card style ────────────────────────────────────────────────────────
const BASE_CARD: ViewStyle = {
  borderRadius: 16,
  backgroundColor: '#ffffff',
  shadowColor: '#0f172a',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
  minHeight: 64,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: 'rgba(226, 232, 240, 0.9)',
  borderLeftWidth: 5,
  width: '92%',
  alignItems: 'center',
  justifyContent: 'center',
};

// ─── Custom toast renderer ────────────────────────────────────────────────────
interface ToastCardProps extends BaseToastProps {
  accentColor: string;
  bgLightColor: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth?: number }>;
}

function ToastCard({
  text1,
  text2,
  accentColor,
  bgLightColor,
  Icon,
  hide,
}: ToastCardProps & { hide?: () => void }) {
  return (
    <View style={[BASE_CARD, { borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        {/* Icon with light badge background */}
        <View style={[styles.iconWrap, { backgroundColor: bgLightColor }]}>
          <Icon size={20} color={accentColor} strokeWidth={2.4} />
        </View>

        {/* Text Area */}
        <View style={styles.textWrap}>
          {text1 ? (
            <Text
              style={styles.text1}
              numberOfLines={2}
              maxFontSizeMultiplier={1.25}
            >
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text
              style={styles.text2}
              numberOfLines={3}
              maxFontSizeMultiplier={1.25}
            >
              {text2}
            </Text>
          ) : null}
        </View>

        {/* Tactile Close button */}
        {hide && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              hide();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
            ]}
          >
            <X size={16} color="#64748b" strokeWidth={2.2} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Export toast config ───────────────────────────────────────────────────────
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#16a34a"
      bgLightColor="#f0fdf4"
      Icon={CheckCircle2}
    />
  ),
  error: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#e11d48"
      bgLightColor="#fff1f2"
      Icon={AlertCircle}
    />
  ),
  warning: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#d97706"
      bgLightColor="#fffbeb"
      Icon={AlertTriangle}
    />
  ),
  info: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#2563eb"
      bgLightColor="#eff6ff"
      Icon={Info}
    />
  ),
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 19,
    includeFontPadding: false,
  },
  text2: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 2,
    lineHeight: 17,
    includeFontPadding: false,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },
});

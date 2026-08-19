import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react-native';

// ─── Shared card style ────────────────────────────────────────────────────────
const BASE_CARD: any = {
  borderRadius: 12,
  backgroundColor: '#ffffff',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
  height: 'auto',
  minHeight: 60,
  paddingVertical: 12,
  paddingRight: 12,
  borderLeftWidth: 4,
  alignItems: 'center',
};

// ─── Custom toast renderer ────────────────────────────────────────────────────
interface ToastCardProps extends BaseToastProps {
  accentColor: string;
  Icon: React.FC<{ size: number; color: string }>;
}

function ToastCard({ text1, text2, onPress, accentColor, Icon, hide }: ToastCardProps & { hide?: () => void }) {
  return (
    <View style={[BASE_CARD, { borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Icon size={22} color={accentColor} />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          {text1 ? (
            <Text style={styles.text1} numberOfLines={2}>
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text style={styles.text2} numberOfLines={3}>
              {text2}
            </Text>
          ) : null}
        </View>

        {/* Close button */}
        <TouchableOpacity
          onPress={hide}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeBtn}
        >
          <X size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Export config ────────────────────────────────────────────────────────────
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#22c55e"
      Icon={({ size, color }) => <CheckCircle2 size={size} color={color} />}
    />
  ),
  error: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#ef4444"
      Icon={({ size, color }) => <XCircle size={size} color={color} />}
    />
  ),
  info: (props: BaseToastProps) => (
    <ToastCard
      {...props}
      accentColor="#3b82f6"
      Icon={({ size, color }) => <Info size={size} color={color} />}
    />
  ),
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
  },
  iconWrap: {
    marginLeft: 10,
    marginRight: 10,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  text2: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
    flexShrink: 0,
  },
});

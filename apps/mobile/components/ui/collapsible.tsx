import React, { PropsWithChildren, useState } from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronDown } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface CollapsibleProps extends PropsWithChildren {
  title: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Collapsible({
  children,
  title,
  defaultOpen = false,
  icon,
  badge,
  className = '',
  style,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colorScheme = useColorScheme() ?? 'light';

  const rotation = useDerivedValue(() => {
    return withTiming(isOpen ? 180 : 0, { duration: 200 });
  }, [isOpen]);

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen((prev) => !prev);
  };

  const isDark = colorScheme === 'dark';

  return (
    <View
      style={style}
      className={`rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      } overflow-hidden shadow-xs mb-3 ${className}`}
    >
      {/* Accordion Trigger */}
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`Toggle ${title}`}
        className="flex-row items-center justify-between p-4 min-h-[48px] active:bg-slate-50 dark:active:bg-slate-800/50"
      >
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          {icon ? <View className="shrink-0">{icon}</View> : null}
          <Text
            maxFontSizeMultiplier={1.25}
            numberOfLines={1}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 flex-1"
            style={{ includeFontPadding: false }}
          >
            {title}
          </Text>
          {badge ? <View className="shrink-0">{badge}</View> : null}
        </View>

        <Animated.View style={chevronStyle} className="shrink-0">
          <ChevronDown
            size={18}
            color={isDark ? '#94a3b8' : '#64748b'}
            strokeWidth={2.2}
          />
        </Animated.View>
      </Pressable>

      {/* Accordion Content */}
      {isOpen && (
        <View className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {children}
        </View>
      )}
    </View>
  );
}

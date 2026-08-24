---
name: mobile-interface
description: Mobile UX & interface architecture for React Native CRM apps. Covers Floating Action Buttons (FAB), bottom action sheets, pull-to-refresh feeds, search debouncing, empty states, and toast notifications. Triggers on FAB, FloatingActionButton, BottomSheet, pull to refresh, RefreshControl, empty states, toast, search debounce, thumb zone, mobile interface.
---

# Mobile Interface & UX Architecture

Mobile interfaces must be **ergonomically optimized for one-handed thumb navigation**, **fast to load with feedback indicators**, and **action-oriented**.

---

## 1. Floating Action Button (FAB)

Primary creation triggers (e.g., "Add Lead", "Log Visit", "Quick Call") should float in the easy thumb reach zone:

```tsx
import { Pressable, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function FloatingActionButton({ onPress, label = 'New Lead' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
      }}
      className="absolute bottom-6 right-6 bg-blue-600 h-14 px-5 rounded-full flex-row items-center gap-2 active:scale-95 transition-transform"
    >
      <Plus size={20} color="#ffffff" strokeWidth={2.5} />
      <Text className="text-white font-extrabold text-sm tracking-wide">{label}</Text>
    </Pressable>
  );
}
```

---

## 2. Pull-to-Refresh Feed UX

All dashboard and lead lists must support native pull-to-refresh with spring feedback:

```tsx
import { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';

export function PullToRefreshScrollView({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#2563eb"
          colors={['#2563eb']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
```

---

## 3. High-Conversion Empty States

Never display a blank empty card. Provide a clear icon, helpful message, and direct action:

```tsx
import { View, Text, Pressable } from 'react-native';
import { Users, Plus } from 'lucide-react-native';

export function EmptyLeadState({ onAddLead }: { onAddLead: () => void }) {
  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 items-center justify-center text-center space-y-3">
      <View className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 items-center justify-center border border-blue-200/60 dark:border-blue-800">
        <Users size={24} color="#2563eb" />
      </View>
      <Text className="text-base font-extrabold text-slate-900 dark:text-white">
        No Active Leads Found
      </Text>
      <Text className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs font-medium">
        There are no buyer inquiries in this filter. Sourced broker leads will appear here automatically.
      </Text>
      <Pressable
        onPress={onAddLead}
        className="mt-2 h-11 px-5 rounded-2xl bg-blue-600 flex-row items-center gap-2 active:scale-95"
      >
        <Plus size={16} color="#ffffff" />
        <Text className="text-white font-bold text-xs">Create New Lead</Text>
      </Pressable>
    </View>
  );
}
```

---

## 4. Toast Feedback with `react-native-toast-message`

Display brief, floating toasts for mutation successes or errors:

```tsx
import Toast from 'react-native-toast-message';

// Success
Toast.show({
  type: 'success',
  text1: 'Follow-up Logged',
  text2: 'Next call reminder set for tomorrow at 10:00 AM',
});

// Error
Toast.show({
  type: 'error',
  text1: 'Call Failed',
  text2: 'Could not connect to auto-dialer native bridge',
});
```

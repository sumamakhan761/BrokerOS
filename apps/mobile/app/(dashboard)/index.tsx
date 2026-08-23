import { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { authClient } from '../../lib/auth-client';

export default function DashboardIndex() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (isPending || !session) return;

      const user = session.user as any;
      if (user?.roleId) {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
        fetch(`${baseUrl}/roles`)
          .then(res => res.json())
          .then(roles => {
            const role = roles.find((r: any) => r.id === user.roleId);
            if (role) {
              const code = role.code;
              let targetPath = '/(dashboard)';

              if (code === 'PRE_SALES') targetPath = '/(dashboard)/pre-sales';
              else if (code === 'PRE_SALES_MANAGER') targetPath = '/(dashboard)/pre-sales-manager';
              else if (code === 'SALES_EXECUTIVE') targetPath = '/(dashboard)/sales-executive';
              else if (code === 'SALES_MANAGER') targetPath = '/(dashboard)/sales-manager';
              else if (code === 'POST_SALES') targetPath = '/(dashboard)/post-sales';
              else if (code === 'POST_SALES_MANAGER') targetPath = '/(dashboard)/post-sales-manager';
              else if (code === 'FINANCE') targetPath = '/(dashboard)/finance';
              else if (code === 'BUSINESS_MANAGER') targetPath = '/(dashboard)/business-manager';
              else if (code === 'DIRECTOR') targetPath = '/(dashboard)/director';
              else if (code === 'ADMIN') targetPath = '/(dashboard)/admin';
              else if (code === 'SOURCING_MANAGER') targetPath = '/(dashboard)/sourcing-manager';
              else if (code === 'CLOSING_MANAGER') targetPath = '/(dashboard)/closing-manager';
              else if (code === 'CHANNEL_PARTNER') targetPath = '/(dashboard)/channel-partner';

              router.replace(targetPath as any);
            }
          })
          .catch(console.error);
      }
    }, [session, isPending, router])
  );

  return (
    <View className="flex-1 bg-[#f8fafc] justify-center items-center">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-4 text-gray-500 font-medium">Loading your department...</Text>
    </View>
  );
}

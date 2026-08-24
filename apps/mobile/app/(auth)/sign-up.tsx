import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react-native';

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-slate-50 items-center justify-center p-6"
    >
      <View className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm max-w-sm w-full items-center text-center gap-4">
        <View className="w-14 h-14 rounded-3xl bg-amber-50 items-center justify-center border border-amber-200/80 mb-1">
          <ShieldAlert size={28} color="#d97706" />
        </View>

        <Text className="text-xl font-black text-slate-900 text-center tracking-tight">
          Restricted Account Creation
        </Text>

        <Text className="text-xs text-slate-500 text-center font-medium leading-relaxed">
          BrokerOS is an enterprise-managed real estate system. Account profiles and identity credentials are provisioned directly by your Department Administrator or Director.
        </Text>

        <View className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 w-full flex-row items-center gap-2.5">
          <Lock size={16} color="#64748b" />
          <Text className="text-[11px] font-bold text-slate-600 flex-1">
            Contact your sales operations lead to request device credentials.
          </Text>
        </View>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable className="w-full h-12 rounded-2xl bg-blue-600 items-center justify-center flex-row gap-2 active:scale-95 transition-transform mt-2">
            <ArrowLeft size={16} color="#ffffff" strokeWidth={2.5} />
            <Text className="text-white font-extrabold text-sm">
              Return to Sign In
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
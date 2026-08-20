import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

type Role = { id: string; name: string; code: string; };

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = authClient.useSession();

  useEffect(() => {
    async function fetchRoles() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseUrl}/roles`);
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    }
    fetchRoles();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password || !phoneNumber || !roleId) {
      setError("Please fill all 4 factors.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        phoneNumber,
        roleId,
      } as any);

      if (authError) {
        setError(authError.message || "Invalid credentials.");
        setLoading(false);
      } else if (data) {
        // Explicitly fetch the session so the layout doesn't bounce us back
        await refetch();
        // Explicitly navigate to the dashboard.
        router.replace('/(dashboard)' as any);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mb-4">
              <Feather name="shield" size={32} color="#2563eb" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center">Strict Access</Text>
            <Text className="text-gray-500 mt-2 text-center">Provide your 4 identity factors.</Text>
          </View>

          {error ? (
            <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          ) : null}

          <View className="space-y-4">
            <View className="relative">
              <View className="absolute z-10 left-4 top-4">
                <Feather name="mail" size={20} color="#64748b" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 text-base"
              />
            </View>

            <View className="relative">
              <View className="absolute z-10 left-4 top-4">
                <Feather name="phone" size={20} color="#64748b" />
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone Number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 text-base"
              />
            </View>

            <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <Picker
                selectedValue={roleId}
                onValueChange={(itemValue) => setRoleId(itemValue)}
                style={{ height: 55, width: '100%' }}
              >
                <Picker.Item label="Select Your Role Identity" value="" color="#94a3b8" />
                {roles.map(r => (
                  <Picker.Item key={r.id} label={r.name} value={r.id} color="#0f172a" />
                ))}
              </Picker>
            </View>

            <View className="relative">
              <View className="absolute z-10 left-4 top-4">
                <Feather name="lock" size={20} color="#64748b" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 text-base"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-2xl mt-8 flex-row justify-center items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify & Sign In</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
import { View, Text, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { authClient } from '../../../lib/auth-client';

export default function BusinessManagerScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch('/dashboard/business-manager', { baseURL });
        setData(res);
      } catch (err: any) {
        setError(err?.response?.status === 403 ? "Access Denied (403)" : "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <View className="flex-1 bg-[#f8fafc] p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-2xl bg-indigo-100 items-center justify-center mb-4">
          <Feather name="bar-chart-2" size={32} color="#4f46e5" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">Business Manager CRM</Text>
        <Text className="text-gray-500 text-center mt-2">Operations overview.</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#4f46e5" />}

      {error ? (
        <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center">
          <Feather name="alert-circle" size={32} color="#dc2626" />
          <Text className="text-red-600 font-bold text-lg mt-2">Unauthorized</Text>
          <Text className="text-red-500 text-center mt-1">{error}</Text>
        </View>
      ) : data ? (
        <View className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm items-center">
          <Feather name="check-circle" size={32} color="#16a34a" />
          <Text className="text-green-600 font-bold text-lg mt-2">Access Granted</Text>
          <Text className="text-gray-500 text-center mt-1">Payload: {JSON.stringify(data.data)}</Text>
        </View>
      ) : null}
    </View>
  );
}
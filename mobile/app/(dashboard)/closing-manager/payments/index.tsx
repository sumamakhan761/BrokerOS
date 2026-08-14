import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { authClient } from '@/lib/auth-client';

export default function PaymentsDashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    if (!session?.user?.id) return;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/payments/closing-manager?managerId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [session]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'PAID') return 'bg-green-100 text-green-700';
    if (status === 'PARTIAL') return 'bg-yellow-100 text-yellow-700';
    if (new Date(dueDate) < new Date()) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const overdue = payments.filter(p => new Date(p.dueDate) < new Date() && p.status === 'PENDING');
  const upcoming = payments.filter(p => new Date(p.dueDate) >= new Date() && p.status === 'PENDING');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Payments</Text>
        <Text className="text-gray-500 mt-1">Track and collect booking installments</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <AlertCircle size={20} color="#DC2626" />
              <Text className="text-gray-600 font-medium ml-2">Overdue</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{overdue.length}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Calendar size={20} color="#2563EB" />
              <Text className="text-gray-600 font-medium ml-2">Upcoming</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{upcoming.length}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4 px-2">Action Required</Text>

        {payments.length === 0 ? (
          <View className="items-center justify-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <CheckCircle2 size={48} color="#10B981" />
            <Text className="text-gray-900 font-bold text-lg mt-4">All Caught Up!</Text>
            <Text className="text-gray-500 text-center mt-2 px-8">There are no pending payments requiring your attention.</Text>
          </View>
        ) : (
          payments.map(payment => (
            <TouchableOpacity
              key={payment.id}
              onPress={() => router.push(`/(dashboard)/closing-manager/payments/${payment.bookingId}` as any)}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                <CreditCard size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">{payment.milestoneName}</Text>
                <Text className="text-gray-500 mb-2">
                  Booking #{payment.booking?.bookingNumber || 'N/A'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-gray-900">
                    ₹{payment.remainingAmount.toLocaleString('en-IN')}
                  </Text>
                  <View className={`px-2 py-1 rounded-md ${getStatusColor(payment.status, payment.dueDate)}`}>
                    <Text className="text-xs font-bold uppercase">
                      Due {new Date(payment.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <ArrowRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
